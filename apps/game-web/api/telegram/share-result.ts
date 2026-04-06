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

type PreparedInlineMessageResult = {
  messageId?: string;
  errorDescription?: string;
};

type BotCapabilities = {
  supportsInlineQueries?: boolean;
  hasMainWebApp?: boolean;
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

function resolveTelegramUserId(payload: any): string | undefined {
  if (typeof payload.userId === "string" && payload.userId.trim()) {
    return payload.userId.trim();
  }

  if (typeof payload.initDataRaw !== "string" || !payload.initDataRaw.trim()) {
    return undefined;
  }

  try {
    const params = new URLSearchParams(payload.initDataRaw);
    const rawUser = params.get("user");
    if (!rawUser) {
      return undefined;
    }

    const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
    if (typeof parsedUser.id === "number" || typeof parsedUser.id === "string") {
      return String(parsedUser.id);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function getBotCapabilities(botToken: string): Promise<BotCapabilities> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    if (!response.ok) {
      return {};
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      result?: {
        supports_inline_queries?: boolean;
        has_main_web_app?: boolean;
      };
    };

    if (!payload.ok || !payload.result) {
      return {};
    }

    return {
      supportsInlineQueries: payload.result.supports_inline_queries,
      hasMainWebApp: payload.result.has_main_web_app
    };
  } catch {
    return {};
  }
}

async function savePreparedInlineMessage(input: {
  botToken: string;
  userId: string;
  title: string;
  text: string;
  deepLinkUrl: string;
}): Promise<PreparedInlineMessageResult> {
  const endpoint = `https://api.telegram.org/bot${input.botToken}/savePreparedInlineMessage`;
  const messageText = `${input.text}\n${input.deepLinkUrl}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: Number(input.userId),
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
      allow_bot_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true
    })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    result?: {
      id?: string;
    };
  };

  if (!response.ok || !payload.ok) {
    return {
      errorDescription: payload.description || `http_${response.status}`
    };
  }

  return {
    messageId: payload.result?.id
  };
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

    if (!payload || typeof payload.text !== "string" || !payload.state || typeof payload.state.testId !== "string") {
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
    let debugReason: string | undefined;
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const effectiveUserId = resolveTelegramUserId(payload);

    if (!botToken) {
      debugReason = "missing_bot_token";
    } else if (!effectiveUserId) {
      debugReason = "missing_user_id";
    } else {
      const botCapabilities = await getBotCapabilities(botToken);
      if (botCapabilities.supportsInlineQueries === false) {
        debugReason = "bot_inline_mode_disabled";
      } else if (botCapabilities.hasMainWebApp === false) {
        debugReason = "bot_main_web_app_disabled";
      } else {
        const prepared = await savePreparedInlineMessage({
          botToken,
          userId: effectiveUserId,
          title: typeof payload.title === "string" ? payload.title : "Cosmic Match result",
          text: payload.text,
          deepLinkUrl
        });
        messageId = prepared.messageId;
        if (!prepared.messageId) {
          debugReason = prepared.errorDescription
            ? `save_prepared_inline_message_failed:${prepared.errorDescription}`
            : "missing_message_id";
        }
      }
    }

    writeJson(res, 200, {
      status: "ok",
      deepLinkUrl,
      shareUrl: shareUrl.toString(),
      shareText: payload.text,
      messageId,
      storyWidgetLinkUrl: deepLinkUrl,
      storyWidgetLinkName: "Make yours",
      debugReason
    });
  } catch (error) {
    writeJson(res, 200, {
      status: "ok",
      deepLinkUrl: "https://t.me/cosmikmatch_bot/cosmic_match",
      shareUrl: "https://t.me/share/url?url=https%3A%2F%2Ft.me%2Fcosmikmatch_bot%2Fcosmic_match",
      shareText: "Open Cosmic Match",
      storyWidgetLinkUrl: "https://t.me/cosmikmatch_bot/cosmic_match",
      storyWidgetLinkName: "Make yours",
      debugReason: error instanceof Error ? `server_exception:${error.name}` : "server_exception"
    });
  }
}
