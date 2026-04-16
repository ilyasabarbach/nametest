import { readJsonBody, verifyTelegramInitData, writeJson } from "./_shared.js";

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

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) {
    writeJson(res, 500, { error: "bot_token_missing" });
    return;
  }

  let payload: any;
  try {
    payload = await readJsonBody(req);
  } catch {
    writeJson(res, 400, { error: "invalid_json" });
    return;
  }

  if (!payload || typeof payload.initDataRaw !== "string") {
    writeJson(res, 400, { error: "invalid_payload" });
    return;
  }

  const initDataDetails = verifyTelegramInitData(payload.initDataRaw);
  if (initDataDetails.status !== "verified") {
    writeJson(res, 403, { error: "invalid_init_data" });
    return;
  }

  try {
    const endpoint = `https://api.telegram.org/bot${botToken}/createInvoiceLink`;
    const tgRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Premium Cosmic Report",
        description: "Unlock full insights and destiny patterns.",
        payload: "report_premium_" + (initDataDetails.user?.id || "unknown"),
        provider_token: "", // Must be empty for Telegram Stars
        currency: "XTR",
        prices: [{ label: "Premium Report", amount: 50 }]
      })
    });

    if (!tgRes.ok) {
      const errorText = await tgRes.text();
      console.error("[telegram/invoice] createInvoiceLink failed", errorText);
      writeJson(res, 502, { error: "telegram_api_error", details: errorText });
      return;
    }

    const tgData = await tgRes.json();
    if (tgData && tgData.ok && tgData.result) {
      writeJson(res, 200, { invoiceUrl: tgData.result });
    } else {
      writeJson(res, 500, { error: "telegram_api_invalid_response" });
    }
  } catch (error) {
    console.error("[telegram/invoice] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
