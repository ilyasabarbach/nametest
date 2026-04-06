import {
  buildDeepLink,
  parseTelegramInitData,
  readJsonBody,
  savePreparedInlineMessage,
  writeJson,
  type TelegramStartAppState
} from "./_shared.js";

export const config = {
  runtime: "nodejs"
};

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

  let payload: any;
  try {
    payload = await readJsonBody(req);
  } catch {
    writeJson(res, 400, { error: "invalid_json" });
    return;
  }

  if (!payload || typeof payload.text !== "string" || !payload.state || typeof payload.state.testId !== "string") {
    writeJson(res, 400, { error: "invalid_payload" });
    return;
  }

  const deepLinkUrl = buildDeepLink(payload.state as TelegramStartAppState, payload.shortId);
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
  const userIdFromPayload = typeof payload.userId === "string" ? payload.userId : undefined;
  const userIdFromInit =
    typeof payload.initDataRaw === "string" ? parseTelegramInitData(payload.initDataRaw).user?.id : undefined;
  const effectiveUserId = userIdFromPayload || userIdFromInit;

  if (!botToken) {
    debugReason = "missing_bot_token";
  } else if (!effectiveUserId) {
    debugReason = "missing_user_id";
  } else {
    try {
      const preparedId = await savePreparedInlineMessage({
        botToken,
        userId: effectiveUserId,
        title: typeof payload.title === "string" ? payload.title : "Cosmic Match result",
        text: payload.text,
        deepLinkUrl
      });
      if (preparedId) {
        messageId = preparedId;
      } else {
        debugReason = "missing_message_id";
      }
    } catch {
      debugReason = "save_prepared_inline_message_failed";
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
}
