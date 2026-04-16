import { readJsonBody, writeJson } from "../telegram/_shared.js";

export const config = {
  runtime: "nodejs"
};

const DEFAULT_STARS_COST = 5;
const DEFAULT_TITLE = "Premium Cosmic Insight";
const DEFAULT_DESCRIPTION = "Unlock your extended cosmic reading with deeper compatibility and destiny signals.";

function toPlaceholderInvoiceUrl(): string {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim() || "cosmikmatch_bot";
  const miniAppShortName = process.env.TELEGRAM_MINI_APP_SHORT_NAME?.trim() || "cosmic_match";
  return `https://t.me/${botUsername}/${miniAppShortName}?startapp=premium_insight`;
}

export default async function handler(req: any, res: any): Promise<void> {
  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.end();
      return;
    }

    if (req.method !== "POST") {
      writeJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    let payload: any = {};
    try {
      payload = await readJsonBody(req);
    } catch {
      // Keep payload optional for this MVP endpoint.
      payload = {};
    }

    const starsCost = Math.max(1, Number(payload?.starsCost) || DEFAULT_STARS_COST);
    const title = String(payload?.title || DEFAULT_TITLE).slice(0, 64);
    const description = String(payload?.description || DEFAULT_DESCRIPTION).slice(0, 255);
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

    if (!botToken) {
      writeJson(res, 200, {
        ok: true,
        invoiceUrl: toPlaceholderInvoiceUrl(),
        starsCost,
        placeholder: true
      });
      return;
    }

    const endpoint = `https://api.telegram.org/bot${botToken}/createInvoiceLink`;
    const telegramResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        payload: `premium_cosmic_insight_${Date.now()}`,
        provider_token: "",
        currency: "XTR",
        prices: [{ label: title, amount: starsCost }]
      })
    });

    if (!telegramResponse.ok) {
      const details = await telegramResponse.text();
      console.error("[payments/create-invoice] createInvoiceLink failed", details);
      writeJson(res, 200, {
        ok: true,
        invoiceUrl: toPlaceholderInvoiceUrl(),
        starsCost,
        placeholder: true
      });
      return;
    }

    const body = await telegramResponse.json();
    if (!body?.ok || typeof body.result !== "string") {
      writeJson(res, 200, {
        ok: true,
        invoiceUrl: toPlaceholderInvoiceUrl(),
        starsCost,
        placeholder: true
      });
      return;
    }

    writeJson(res, 200, {
      ok: true,
      invoiceUrl: body.result,
      starsCost,
      placeholder: false
    });
  } catch (error) {
    console.error("[payments/create-invoice] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
