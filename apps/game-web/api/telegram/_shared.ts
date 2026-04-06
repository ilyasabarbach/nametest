import { createHmac, randomUUID } from "node:crypto";

export type TelegramStartAppState = {
  version: 1;
  testId: string;
  feedItemId?: string;
  template?: string;
  resultKey?: string;
};

const DEFAULT_TELEGRAM_BOT_USERNAME = "cosmikmatch_bot";
const DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME = "cosmic_match";
const STARTAPP_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type StoredStartAppState = {
  state: TelegramStartAppState;
  expiresAt: number;
};

const startAppStateStore = new Map<string, StoredStartAppState>();

export function writeJson(res: any, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

export function readJsonBody(req: any): Promise<unknown> {
  if (typeof req.body !== "undefined") {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding?.("utf8");
    req.on?.("data", (chunk: string) => {
      raw += chunk;
    });
    req.on?.("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on?.("error", reject);
  });
}

export function normalizeBotUsername(raw: string | undefined): string | null {
  const normalized = raw?.trim().replace(/^@+/, "");
  return normalized ? normalized : null;
}

export function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function decodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function signStartAppPayload(encodedPayload: string): string {
  const secret = process.env.TELEGRAM_STARTAPP_SECRET?.trim();
  if (!secret) {
    return encodedPayload;
  }

  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function encodeStartAppState(state: TelegramStartAppState): string {
  return signStartAppPayload(encodeBase64Url(JSON.stringify(state)));
}

export function decodeSignedStartAppPayload(token: string): TelegramStartAppState | null {
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
    const payload = JSON.parse(json) as any;
    if ((payload?.version !== 1 && payload?.version !== 2) || typeof payload.testId !== "string") {
      return null;
    }
    return payload as TelegramStartAppState;
  } catch {
    return null;
  }
}

function cleanupExpiredStartAppTokens(now = Date.now()): void {
  for (const [token, entry] of startAppStateStore.entries()) {
    if (entry.expiresAt <= now) {
      startAppStateStore.delete(token);
    }
  }
}

function createShortStartAppToken(): string {
  const random = randomUUID().replace(/-/g, "").slice(0, 10);
  return `r${random}`;
}

export function storeStartAppState(state: TelegramStartAppState): string {
  const now = Date.now();
  cleanupExpiredStartAppTokens(now);
  const token = createShortStartAppToken();
  startAppStateStore.set(token, {
    state,
    expiresAt: now + STARTAPP_TOKEN_TTL_MS
  });
  return token;
}

export function resolveStartAppState(token: string): TelegramStartAppState | null {
  if (!token) {
    return null;
  }

  if (token.startsWith("r")) {
    cleanupExpiredStartAppTokens();
    const entry = startAppStateStore.get(token);
    if (!entry || entry.expiresAt <= Date.now()) {
      startAppStateStore.delete(token);
      return null;
    }
    return entry.state;
  }

  return decodeSignedStartAppPayload(token);
}

export function buildDeepLink(startState: TelegramStartAppState, shortId?: string): string | null {
  const botUsername = normalizeBotUsername(process.env.TELEGRAM_BOT_USERNAME) ?? DEFAULT_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return null;
  }

  const miniAppShortName =
    process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim().replace(/^\/+/, "") || DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME;
  const basePath = miniAppShortName ? `/${botUsername}/${miniAppShortName}` : `/${botUsername}`;
  const shortToken = shortId ?? storeStartAppState(startState);
  return `https://t.me${basePath}?startapp=${encodeURIComponent(shortToken)}`;
}

export function parseTelegramInitData(raw: string): {
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

export function verifyTelegramInitData(raw: string): {
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

export async function savePreparedInlineMessage(input: {
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
        id: randomUUID(),
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
