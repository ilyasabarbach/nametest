import {
  buildDeepLink,
  readJsonBody,
  savePreparedInlineMessage,
  writeJson,
  type TelegramStartAppState
} from "./_shared";

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

  const deepLinkUrl = buildDeepLink(payload.state as TelegramStartAppState);
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
    try {
      const preparedId = await savePreparedInlineMessage({
        botToken,
        userId: payload.userId,
        title: typeof payload.title === "string" ? payload.title : "Cosmic Match result",
        text: payload.text,
        deepLinkUrl
      });
      if (preparedId) {
        messageId = preparedId;
      }
    } catch {
      messageId = undefined;
    }
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
}
