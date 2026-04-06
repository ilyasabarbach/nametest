export const config = {
  runtime: "nodejs"
};

type TelegramStartAppState = {
  version: 1;
  testId: string;
  feedItemId?: string;
  template?: string;
  resultKey?: string;
};

const DEFAULT_TELEGRAM_BOT_USERNAME = "cosmikmatch_bot";
const DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME = "cosmic_match";

function writeJson(res: any, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

function normalizeBotUsername(raw: string | undefined): string | null {
  const normalized = raw?.trim().replace(/^@+/, "");
  return normalized ? normalized : null;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

async function signStartAppPayload(encodedPayload: string): Promise<string> {
  const secret = process.env.TELEGRAM_STARTAPP_SECRET?.trim();
  if (!secret) {
    return encodedPayload;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  const signature = Buffer.from(signatureBuffer).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

async function buildDeepLink(startState: TelegramStartAppState): Promise<string | null> {
  const botUsername = normalizeBotUsername(process.env.TELEGRAM_BOT_USERNAME) ?? DEFAULT_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return null;
  }

  const miniAppShortName =
    process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim().replace(/^\/+/, "") || DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME;
  const encodedPayload = encodeBase64Url(JSON.stringify(startState));
  const startapp = await signStartAppPayload(encodedPayload);
  const basePath = miniAppShortName ? `/${botUsername}/${miniAppShortName}` : `/${botUsername}`;
  return `https://t.me${basePath}?startapp=${encodeURIComponent(startapp)}`;
}

async function savePreparedInlineMessage(input: {
  botToken: string;
  userId: string;
  title: string;
  text: string;
  deepLinkUrl: string;
}): Promise<string | null> {
  const endpoint = `https://api.telegram.org/bot${input.botToken}/savePreparedInlineMessage`;
  const messageText = `${input.text}\n${input.deepLinkUrl}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: Number.parseInt(input.userId, 10),
      result: {
        type: "article",
        id: `share-${Date.now()}`,
        title: input.title,
        description: input.text.slice(0, 180),
        input_message_content: {
          message_text: messageText
        },
        reply_markup: {
          inline_keyboard: [[{ text: "Make yours", url: input.deepLinkUrl }]]
        }
      },
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

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    writeJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  try {
    let payload: any = {};
    if (typeof req.body === "string") {
      payload = JSON.parse(req.body);
    } else if (typeof req.body === "object" && req.body !== null) {
      payload = req.body;
    }
    if (typeof payload.text !== "string" || !payload.state || typeof payload.state.testId !== "string") {
      writeJson(res, 400, { error: "invalid_payload" });
      return;
    }

    const deepLinkUrl = await buildDeepLink(payload.state as TelegramStartAppState);
    if (!deepLinkUrl) {
      writeJson(res, 400, { error: "missing_bot_username" });
      return;
    }

    const shareUrl = new URL("https://t.me/share/url");
    shareUrl.searchParams.set("url", deepLinkUrl);
    shareUrl.searchParams.set("text", payload.text);

    let messageId: string | undefined;
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (botToken && typeof payload.userId === "string") {
      messageId =
        (await savePreparedInlineMessage({
          botToken,
          userId: payload.userId,
          title: typeof payload.title === "string" ? payload.title : "Cosmic Match result",
          text: payload.text,
          deepLinkUrl
        })) ?? undefined;
    }

    writeJson(res, 200, {
      status: "ok",
      deepLinkUrl,
      shareUrl: shareUrl.toString(),
      shareText: payload.text,
      messageId,
      storyWidgetLinkUrl: deepLinkUrl,
      storyWidgetLinkName: "Make yours"
    });
  } catch (error) {
    writeJson(res, 200, {
      status: "ok",
      deepLinkUrl: "https://t.me/cosmikmatch_bot/cosmic_match",
      shareUrl: "https://t.me/share/url?url=https%3A%2F%2Ft.me%2Fcosmikmatch_bot%2Fcosmic_match",
      shareText: "Open Cosmic Match",
      storyWidgetLinkUrl: "https://t.me/cosmikmatch_bot/cosmic_match",
      storyWidgetLinkName: error instanceof Error ? `fallback:${error.name}` : "Make yours"
    });
  }
}
