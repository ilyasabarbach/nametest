import { createServer } from "node:http";
import { createHmac, randomUUID } from "node:crypto";
import {
  buildGeneratedPosterDataUrl,
  getFallbackDiscoveryFeedPage,
  type HomeFeedLocale
} from "@nametests/content-packs";
import {
  isArtifactRemixRequest,
  isDiscoveryFeedPagePayload,
  isTelegramInitDataVerifyRequest,
  isTelegramPrepareShareRequest,
  type ArtifactRemixRequest,
  type ArtifactRemixResponse,
  type TelegramPrepareShareResponse,
  type TelegramStartAppState
} from "@nametests/backend-contracts";

const DEFAULT_PORT = 8787;
const allowedLocales: HomeFeedLocale[] = ["en", "fr", "es", "de", "ar", "pt"];
const DEFAULT_TELEGRAM_BOT_USERNAME = "cosmikmatch_bot";
const DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME = "cosmic_match";
const ephemeralShareMedia = new Map<
  string,
  {
    contentType: string;
    buffer: Buffer;
    expiresAt: number;
  }
>();

function resolveLocale(input: string | null): HomeFeedLocale {
  return allowedLocales.find((locale) => locale === input) ?? "en";
}

function writeJson(response: import("node:http").ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(body));
}

function writeBinary(
  response: import("node:http").ServerResponse,
  statusCode: number,
  buffer: Buffer,
  contentType: string,
  maxAgeSeconds = 600
): void {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
    "Cache-Control": `public, max-age=${maxAgeSeconds}`,
    "Access-Control-Allow-Origin": "*"
  });
  response.end(buffer);
}

function parseJsonBody(request: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function signStartAppPayload(encodedPayload: string): string {
  const secret = process.env.TELEGRAM_STARTAPP_SECRET?.trim();
  if (!secret) {
    return encodedPayload;
  }

  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function decodeSignedStartAppPayload(token: string): TelegramStartAppState | null {
  const [encodedPayload, providedSignature] = token.split(".", 2);
  const secret = process.env.TELEGRAM_STARTAPP_SECRET?.trim();
  if (secret) {
    const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
    if (!providedSignature || providedSignature !== expectedSignature) {
      return null;
    }
  }

  const json = decodeBase64Url(encodedPayload);
  if (!json) {
    return null;
  }

  try {
    const payload = JSON.parse(json) as TelegramStartAppState;
    if (payload?.version !== 1 || typeof payload.testId !== "string") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function encodeStartAppState(state: TelegramStartAppState): string {
  return signStartAppPayload(encodeBase64Url(JSON.stringify(state)));
}

function normalizeBotUsername(raw: string | undefined): string | null {
  const normalized = raw?.trim().replace(/^@+/, "");
  return normalized ? normalized : null;
}

function buildDeepLink(startState: TelegramStartAppState): string | null {
  const botUsername = normalizeBotUsername(process.env.TELEGRAM_BOT_USERNAME) ?? DEFAULT_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return null;
  }

  const miniAppShortName =
    process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim().replace(/^\/+/, "") || DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME;
  const basePath = miniAppShortName ? `/${botUsername}/${miniAppShortName}` : `/${botUsername}`;
  return `https://t.me${basePath}?startapp=${encodeURIComponent(encodeStartAppState(startState))}`;
}

async function savePreparedInlineMessage(input: {
  botToken: string;
  userId: string;
  title: string;
  text: string;
  deepLinkUrl: string;
  photoUrl?: string;
}): Promise<string | null> {
  const endpoint = `https://api.telegram.org/bot${input.botToken}/savePreparedInlineMessage`;
  const messageText = `${input.text}\n${input.deepLinkUrl}`;
  const baseResult = {
    id: randomUUID(),
    reply_markup: {
      inline_keyboard: [[{ text: "Make yours", url: input.deepLinkUrl }]]
    }
  };
  const result = input.photoUrl
    ? {
        ...baseResult,
        type: "photo",
        photo_url: input.photoUrl,
        thumbnail_url: input.photoUrl,
        title: input.title,
        caption: input.text
      }
    : {
        ...baseResult,
        type: "article",
        title: input.title,
        description: input.text.slice(0, 180),
        input_message_content: {
          message_text: messageText
        }
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: input.userId,
      result,
      allow_user_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    result?: {
      id?: string;
    };
  };
  return payload.ok && payload.result?.id ? payload.result.id : null;
}

function dataUrlToBinary(dataUrl: string): { contentType: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const [, contentType, base64Payload] = match;
  return {
    contentType,
    buffer: Buffer.from(base64Payload, "base64")
  };
}

function registerShareMedia(dataUrl: string): { mediaId: string; contentType: string } | null {
  const binary = dataUrlToBinary(dataUrl);
  if (!binary) {
    return null;
  }

  const mediaId = randomUUID();
  ephemeralShareMedia.set(mediaId, {
    contentType: binary.contentType,
    buffer: binary.buffer,
    expiresAt: Date.now() + 1000 * 60 * 30
  });
  return {
    mediaId,
    contentType: binary.contentType
  };
}

function cleanExpiredShareMedia(): void {
  const now = Date.now();
  for (const [mediaId, entry] of ephemeralShareMedia.entries()) {
    if (entry.expiresAt <= now) {
      ephemeralShareMedia.delete(mediaId);
    }
  }
}

function parseTelegramInitData(raw: string): {
  hash?: string;
  startParam?: string;
  user?: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
    photoUrl?: string;
  };
  dataCheckString: string;
} {
  const params = new URLSearchParams(raw);
  const entries = [...params.entries()];
  const hash = params.get("hash") ?? undefined;
  const dataCheckString = entries
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  let user:
    | {
        id: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        languageCode?: string;
        photoUrl?: string;
      }
    | undefined;

  const rawUser = params.get("user");
  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
      if (typeof parsedUser.id === "number") {
        user = {
          id: String(parsedUser.id),
          username: typeof parsedUser.username === "string" ? parsedUser.username : undefined,
          firstName: typeof parsedUser.first_name === "string" ? parsedUser.first_name : undefined,
          lastName: typeof parsedUser.last_name === "string" ? parsedUser.last_name : undefined,
          languageCode: typeof parsedUser.language_code === "string" ? parsedUser.language_code : undefined,
          photoUrl: typeof parsedUser.photo_url === "string" ? parsedUser.photo_url : undefined
        };
      }
    } catch {
      user = undefined;
    }
  }

  return {
    hash,
    startParam: params.get("start_param") ?? undefined,
    user,
    dataCheckString
  };
}

function verifyTelegramInitData(raw: string): {
  status: "verified" | "unverified" | "invalid";
  startParam?: string;
  user?: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
    photoUrl?: string;
  };
} {
  const parsed = parseTelegramInitData(raw);
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!parsed.hash) {
    return {
      status: "invalid"
    };
  }

  if (!botToken) {
    return {
      status: "unverified",
      startParam: parsed.startParam,
      user: parsed.user
    };
  }

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = createHmac("sha256", secret).update(parsed.dataCheckString).digest("hex");
  return {
    status: calculatedHash === parsed.hash ? "verified" : "invalid",
    startParam: parsed.startParam,
    user: parsed.user
  };
}

function handleFeedRequest(requestUrl: URL, response: import("node:http").ServerResponse): void {
  const locale = resolveLocale(requestUrl.searchParams.get("locale"));
  const cursor = requestUrl.searchParams.get("cursor") ?? undefined;
  const payload = getFallbackDiscoveryFeedPage(locale, cursor);

  if (!isDiscoveryFeedPagePayload(payload)) {
    writeJson(response, 500, { error: "invalid_payload" });
    return;
  }

  writeJson(response, 200, payload);
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function buildSyntheticArtifact(request: ArtifactRemixRequest): ArtifactRemixResponse {
  const baseSeed = hashSeed(
    [
      request.testId,
      request.recipeId,
      request.template,
      request.names.primaryName,
      request.names.partnerName,
      request.result.resultKey
    ].join("|")
  );
  const displayName = request.names.primaryName || request.result.title;
  const duoName = request.names.partnerName
    ? `${request.names.primaryName} + ${request.names.partnerName}`
    : request.names.primaryName || request.result.title;
  const accentPalettes = {
    cosmic: ["#7c5cff", "#2bc0ff", "#ff87b5"],
    spotlight: ["#ffd166", "#72ddf7", "#ff8fab"],
    tabloid: ["#ff5d73", "#f0a202", "#6c63ff"],
    headline: ["#00a6fb", "#fb5607", "#8338ec"],
    portrait: ["#f3c78d", "#d5a6ff", "#8fd6ff"],
    storybook: ["#f0be6b", "#c98fa9", "#90b4f8"]
  } satisfies Record<ArtifactRemixRequest["template"], string[]>;
  const pickAccent = (template: ArtifactRemixRequest["template"]) =>
    pick(accentPalettes[template], baseSeed + 4);

  if (request.template === "portrait") {
    const portraitTitles = ["Velvet Portrait", "Rare Light Portrait", "Aura Portrait", "Luminous Echo"];
    const portraitBodies = [
      `${displayName} now reads like a polished portrait with soft power and immediate presence.`,
      `${displayName} lands with camera-ready calm and the kind of glow people instantly remember.`,
      `${displayName} feels edited into a richer aura now: warmer, rarer, and more personal.`,
      `${displayName} looks like the kind of portrait people save because it feels specific to one person.`
    ];
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["Portrait remix ready", "AI portrait glow", "Rare portrait pull"], baseSeed),
        title: pick(portraitTitles, baseSeed + 1),
        body: pick(portraitBodies, baseSeed + 2),
        insight: pick(
          [
            "This remix works when it feels like a private portrait turned into a public artifact.",
            "The strongest portrait versions feel intimate first and shareable second.",
            "This version adds the kind of finish that makes the result feel made for one person."
          ],
          baseSeed + 3
        ),
        signature: `PORTRAIT-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the portrait version, then ask someone else to make theirs.",
        accent: pickAccent("portrait"),
        badgeLabel: "AI portrait preview",
        posterImageDataUrl:
          request.imageRecipeId === "past-life-vintage-poster"
            ? buildGeneratedPosterDataUrl({
                recipeId: request.imageRecipeId,
                primaryName: displayName,
                resultKey: request.result.resultKey,
                resultTitle: request.result.title,
                body: request.result.body,
                insight: request.result.insight,
                accent: pickAccent("portrait"),
                presentPortraitImageDataUrl: request.presentPhotoDataUrl
              })
            : undefined
      }
    };
  }

  if (request.template === "storybook") {
    const storyTitles = ["Storybook Cover", "Golden Chapter Cover", "Mythic Echo Cover", "Velvet Tale Cover"];
    const storyBodies = [
      `${displayName} now reads like a cover line from a story people would tap just to see the next chapter.`,
      `${duoName} feels reframed as a richer fable, with more atmosphere and a cleaner sense of destiny.`,
      `${displayName} now sounds like the title of a book someone would screenshot before they even open it.`,
      `${duoName} has been remixed into a cover-style artifact with a stronger sense of mystery and memory.`
    ];
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["Story remix ready", "Book-cover pull", "Legend-cover preview"], baseSeed),
        title: pick(storyTitles, baseSeed + 1),
        body: pick(storyBodies, baseSeed + 2),
        insight: pick(
          [
            "Storybook remixes feel strongest when they sound like a cover, not a paragraph.",
            "The best story versions suggest a whole world without needing to explain it.",
            "This remix adds the kind of mythic framing that makes the artifact feel collectible."
          ],
          baseSeed + 3
        ),
        signature: `STORY-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cover version and invite someone else to open their story.",
        accent: pickAccent("storybook"),
        badgeLabel: "AI story preview",
        posterImageDataUrl:
          request.imageRecipeId === "past-life-vintage-poster"
            ? buildGeneratedPosterDataUrl({
                recipeId: request.imageRecipeId,
                primaryName: displayName,
                resultKey: request.result.resultKey,
                resultTitle: request.result.title,
                body: request.result.body,
                insight: request.result.insight,
                accent: pickAccent("storybook"),
                presentPortraitImageDataUrl: request.presentPhotoDataUrl
              })
            : undefined
      }
    };
  }

  if (request.template === "headline") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["AI headline drop", "Future headline pull", "Main-story preview"], baseSeed),
        title: pick(["Main Character Headline", "Breaking Future Headline", "Front Feed Bulletin"], baseSeed + 1),
        body: pick(
          [
            `${displayName} now lands like a sharper social headline with more momentum and screenshot pull.`,
            `${displayName} has been reframed into a more public-facing headline artifact that feels faster and bolder.`,
            `${displayName} now reads like something people would repost because the headline alone already carries status.`
          ],
          baseSeed + 2
        ),
        insight: pick(
          [
            "Headline remixes work when the copy feels punchy enough to share without extra context.",
            "The strongest headline versions feel like a status label, not just a sentence.",
            "This format wins when it looks public, immediate, and flattering."
          ],
          baseSeed + 3
        ),
        signature: `HEADLINE-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the headline version and see who wants their own.",
        accent: pickAccent("headline"),
        badgeLabel: "AI headline preview"
      }
    };
  }

  if (request.template === "tabloid") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["Magazine remix ready", "Tabloid energy pull", "Cover-story preview"], baseSeed),
        title: pick(["Front Page Chemistry", "Cover Story Energy", "Viral Cover Pull"], baseSeed + 1),
        body: pick(
          [
            `${duoName} now reads like a louder magazine cover with bigger emotion and a more share-first finish.`,
            `${duoName} has been remixed into a tabloid-style artifact that feels hotter, bolder, and more attention-grabbing.`,
            `${duoName} now carries the kind of cover-story energy people screenshot for the drama alone.`
          ],
          baseSeed + 2
        ),
        insight: pick(
          [
            "Magazine remixes win when the emotion gets bigger before the copy gets longer.",
            "The best cover versions feel bold enough to stop the scroll instantly.",
            "This format works when it exaggerates the feeling without breaking the fantasy."
          ],
          baseSeed + 3
        ),
        signature: `TABLOID-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cover-story version and invite someone else to make theirs.",
        accent: pickAccent("tabloid"),
        badgeLabel: "AI magazine preview"
      }
    };
  }

  if (request.template === "spotlight") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["Badge remix ready", "Spotlight aura pull", "Status-badge preview"], baseSeed),
        title: pick(["Spotlight Badge", "Rare Energy Badge", "Social Aura Badge"], baseSeed + 1),
        body: pick(
          [
            `${displayName} now carries a cleaner badge-style identity with brighter confidence and more social-flex energy.`,
            `${displayName} has been upgraded into a sharper spotlight artifact that feels more collectible and status-driven.`,
            `${displayName} now looks like the kind of badge someone posts because they want the label to stick.`
          ],
          baseSeed + 2
        ),
        insight: pick(
          [
            "Badge remixes win when they feel like a label people want to claim publicly.",
            "The strongest badge artifacts are simple, flattering, and easy to repost.",
            "This format works best when it feels status-first and explanation-second."
          ],
          baseSeed + 3
        ),
        signature: `SPOTLIGHT-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the badge version and invite someone else to claim theirs.",
        accent: pickAccent("spotlight"),
        badgeLabel: "AI badge preview"
      }
    };
  }

  if (request.template === "cosmic") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: request.template,
      artifact: {
        hook: pick(["AI aura surge", "Cosmic remix ready", "Destiny poster preview"], baseSeed),
        title: pick(["Luminous Match Poster", "Destiny Poster Remix", "Aura Pull Poster"], baseSeed + 1),
        body: pick(
          [
            `${duoName} now feels turned into a brighter cosmic poster with more aura, more glow, and stronger share energy.`,
            `${duoName} has been remixed into a richer destiny-style artifact that feels more personal and more dramatic.`,
            `${duoName} now reads like the kind of glowing match poster people repost because it flatters both names at once.`
          ],
          baseSeed + 2
        ),
        insight: pick(
          [
            "Cosmic remixes work when they feel flattering, vivid, and instantly postable.",
            "The best aura posters feel personal enough to save and dramatic enough to share.",
            "This format wins when it turns a simple result into a brighter identity artifact."
          ],
          baseSeed + 3
        ),
        signature: `COSMIC-${String(baseSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cosmic version and let someone else reveal theirs.",
        accent: pickAccent("cosmic"),
        badgeLabel: "AI aura preview"
      }
    };
  }

  return {
    status: "ok",
    mode: "synthetic-preview",
    template: request.template,
    artifact: {
      hook: request.result.hook,
      title: `${request.result.title} Remix`,
      body: `${request.result.body} This upgraded version is tuned to feel more personal and more share-ready.`,
      insight: request.result.insight,
      signature: `${request.result.signature}-AI`,
      sharePrompt: "Share the upgraded version and invite someone else to make theirs.",
      accent: pickAccent("cosmic"),
      badgeLabel: "AI preview",
      posterImageDataUrl:
        request.imageRecipeId === "past-life-vintage-poster"
          ? buildGeneratedPosterDataUrl({
              recipeId: request.imageRecipeId,
              primaryName: displayName,
              resultKey: request.result.resultKey,
              resultTitle: request.result.title,
              body: request.result.body,
              insight: request.result.insight,
              accent: pickAccent("cosmic"),
              presentPortraitImageDataUrl: request.presentPhotoDataUrl
            })
          : undefined
    }
  };
}

async function requestCloudflareImage(prompt: string): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model = process.env.CLOUDFLARE_IMAGE_MODEL ?? "@cf/black-forest-labs/flux-1-schnell";
  if (!accountId || !apiToken) {
    return null;
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "image/png"
      },
      body: JSON.stringify({
        prompt,
        width: 768,
        height: 1024,
        num_steps: 4
      })
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return `data:${contentType};base64,${buffer.toString("base64")}`;
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const result = payload.result as Record<string, unknown> | undefined;
    const image = typeof result?.image === "string" ? result.image : null;
    if (!image) {
      return null;
    }

    return image.startsWith("data:") ? image : `data:image/png;base64,${image}`;
  } catch {
    return null;
  }
}

async function handleArtifactRemixRequest(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse
): Promise<void> {
  let payload: unknown;
  try {
    payload = await parseJsonBody(request);
  } catch {
    writeJson(response, 400, { error: "invalid_json" });
    return;
  }

  if (!isArtifactRemixRequest(payload)) {
    writeJson(response, 400, { error: "invalid_payload" });
    return;
  }

  const result = buildSyntheticArtifact(payload);
  if (payload.imageRecipeId === "past-life-vintage-poster") {
    const portraitDataUrl = await requestCloudflareImage(
      `Vintage sepia portrait, 1920s photo studio, elegant clothing, soft smile, editorial past life aesthetic, mystery aura, high detail`
    );
    if (portraitDataUrl) {
      result.artifact.posterImageDataUrl = buildGeneratedPosterDataUrl({
        recipeId: payload.imageRecipeId,
        primaryName: payload.names.primaryName || payload.result.title,
        resultKey: payload.result.resultKey,
        resultTitle: payload.result.title,
        body: payload.result.body,
        insight: payload.result.insight,
        accent: result.artifact.accent ?? "#c98fa9",
        presentPortraitImageDataUrl: payload.presentPhotoDataUrl,
        portraitImageDataUrl: portraitDataUrl
      });
      result.artifact.badgeLabel = "AI portrait generated";
    }
  }

  writeJson(response, 200, result);
}

async function handleTelegramInitVerifyRequest(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse
): Promise<void> {
  let payload: unknown;
  try {
    payload = await parseJsonBody(request);
  } catch {
    writeJson(response, 400, { error: "invalid_json" });
    return;
  }

  if (!isTelegramInitDataVerifyRequest(payload)) {
    writeJson(response, 400, { error: "invalid_payload" });
    return;
  }

  writeJson(response, 200, verifyTelegramInitData(payload.initDataRaw));
}

function handleTelegramStartAppResolveRequest(
  requestUrl: URL,
  response: import("node:http").ServerResponse
): void {
  const token = requestUrl.searchParams.get("startapp") ?? "";
  const state = token ? decodeSignedStartAppPayload(token) : null;
  if (!state) {
    writeJson(response, 200, { status: "invalid" });
    return;
  }

  writeJson(response, 200, {
    status: "ok",
    state
  });
}

async function handleTelegramPrepareShareRequest(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse,
  requestUrl: URL
): Promise<void> {
  let payload: unknown;
  try {
    payload = await parseJsonBody(request);
  } catch {
    writeJson(response, 400, { error: "invalid_json" });
    return;
  }

  if (!isTelegramPrepareShareRequest(payload)) {
    writeJson(response, 400, { error: "invalid_payload" });
    return;
  }

  const deepLinkUrl = buildDeepLink(payload.state);
  if (!deepLinkUrl) {
    writeJson(response, 400, { error: "missing_bot_username" });
    return;
  }

  const shareUrl = new URL("https://t.me/share/url");
  shareUrl.searchParams.set("url", deepLinkUrl);
  shareUrl.searchParams.set("text", payload.text);

  const prepared: TelegramPrepareShareResponse = {
    status: "ok",
    deepLinkUrl,
    shareUrl: shareUrl.toString(),
    shareText: payload.text,
    storyWidgetLinkUrl: deepLinkUrl,
    storyWidgetLinkName: "Make yours"
  };

  let publicPosterUrl: string | undefined;
  const publicBaseUrl = process.env.TELEGRAM_PUBLIC_BASE_URL?.trim();
  if (publicBaseUrl && payload.imageDataUrl) {
    cleanExpiredShareMedia();
    const media = registerShareMedia(payload.imageDataUrl);
    if (media) {
      const storyUrl = new URL(`/api/telegram/share-media/${media.mediaId}`, publicBaseUrl);
      storyUrl.searchParams.set("filename", payload.filename ?? "result.png");
      prepared.storyMediaUrl = storyUrl.toString();
      publicPosterUrl = prepared.storyMediaUrl;
    }
  } else if (requestUrl.origin !== "null" && payload.imageDataUrl) {
    cleanExpiredShareMedia();
    const media = registerShareMedia(payload.imageDataUrl);
    if (media) {
      const origin = process.env.TELEGRAM_PUBLIC_BASE_URL?.trim();
      if (origin) {
        prepared.storyMediaUrl = new URL(`/api/telegram/share-media/${media.mediaId}`, origin).toString();
        publicPosterUrl = prepared.storyMediaUrl;
      }
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (botToken && payload.userId) {
    try {
      const messageId = await savePreparedInlineMessage({
        botToken,
        userId: payload.userId,
        title: payload.title ?? "Cosmic Match result",
        text: payload.text,
        deepLinkUrl,
        photoUrl: publicPosterUrl
      });
      if (messageId) {
        prepared.messageId = messageId;
      }
    } catch {
      // Fall back to URL-based share when prepared message creation fails.
    }
  }

  writeJson(response, 200, prepared);
}

const server = createServer((request, response) => {
  if (!request.url) {
    writeJson(response, 400, { error: "missing_url" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, "http://localhost");

  if (request.method === "GET" && (requestUrl.pathname === "/health" || requestUrl.pathname === "/api/health")) {
    writeJson(response, 200, {
      status: "ok",
      service: "discovery-feed-api",
      now: new Date().toISOString()
    });
    return;
  }

  if (request.method === "GET" && (requestUrl.pathname === "/discovery-feed" || requestUrl.pathname === "/api/discovery-feed")) {
    handleFeedRequest(requestUrl, response);
    return;
  }

  if (request.method === "POST" && (requestUrl.pathname === "/artifact-remix" || requestUrl.pathname === "/api/artifact-remix")) {
    void handleArtifactRemixRequest(request, response);
    return;
  }

  if (request.method === "POST" && (requestUrl.pathname === "/telegram/init-verify" || requestUrl.pathname === "/api/telegram/init-verify")) {
    void handleTelegramInitVerifyRequest(request, response);
    return;
  }

  if (request.method === "GET" && (requestUrl.pathname === "/telegram/startapp-resolve" || requestUrl.pathname === "/api/telegram/startapp-resolve")) {
    handleTelegramStartAppResolveRequest(requestUrl, response);
    return;
  }

  if (request.method === "POST" && (requestUrl.pathname === "/telegram/share-result" || requestUrl.pathname === "/api/telegram/share-result")) {
    void handleTelegramPrepareShareRequest(request, response, requestUrl);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/api/telegram/share-media/")) {
    cleanExpiredShareMedia();
    const mediaId = requestUrl.pathname.split("/").at(-1) ?? "";
    const media = ephemeralShareMedia.get(mediaId);
    if (!media) {
      writeJson(response, 404, { error: "media_not_found" });
      return;
    }

    writeBinary(response, 200, media.buffer, media.contentType);
    return;
  }

  writeJson(response, 404, { error: "not_found" });
});

const port = Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10) || DEFAULT_PORT;

server.listen(port, () => {
  console.log(`Discovery feed API listening on http://localhost:${port}`);
});
