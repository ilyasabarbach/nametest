import { writeJson, readJsonBody, normalizeBotUsername } from "./_shared.js";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req: any, res: any): Promise<void> {
  try {
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

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      writeJson(res, 500, { error: "bot_token_missing" });
      return;
    }

    let body: any;
    try {
      body = await readJsonBody(req);
    } catch {
      writeJson(res, 400, { error: "invalid_json" });
      return;
    }

    if (body.pre_checkout_query) {
      const endpoint = `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`;
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: body.pre_checkout_query.id,
          ok: true
        })
      });
    } else if (body.message?.text?.startsWith("/start")) {
      const chatId = body.message.chat.id;
      const miniAppShortName =
        process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim().replace(/^\/+/, "") || "cosmic_match";
      const botUsername = normalizeBotUsername(process.env.TELEGRAM_BOT_USERNAME) || "cosmikmatch_bot";
      const webAppUrl = `https://t.me/${botUsername}/${miniAppShortName}`;

      const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚀 Welcome back! Ready to see if you have true Cosmic compatibility?",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Play Cosmic Match",
                  web_app: { url: `https://${process.env.VERCEL_URL || "nametests-telegram.vercel.app"}` }
                }
              ]
            ]
          }
        })
      });
    }

    // Always acknowledge Telegram webhook
    writeJson(res, 200, { ok: true });
  } catch (error) {
    console.error("[telegram/webhook] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
