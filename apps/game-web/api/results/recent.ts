import { readJsonBody, writeJson } from "../telegram/_shared.js";
import { recordRecentResultToStore } from "./_store.js";

export const config = {
  runtime: "nodejs"
};

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

    let body: any;
    try {
      body = await readJsonBody(req);
    } catch {
      writeJson(res, 400, { error: "invalid_json" });
      return;
    }

    const testId = String(body?.testId ?? body?.result?.testId ?? "").trim();
    const resultTitle = String(body?.resultTitle ?? body?.result?.title ?? "").trim();
    const primaryName = String(body?.primaryName ?? body?.result?.names?.primaryName ?? "").trim();

    if (!testId || !resultTitle) {
      writeJson(res, 400, { error: "missing_fields" });
      return;
    }

    await recordRecentResultToStore({
      testId,
      resultTitle,
      primaryName
    });

    writeJson(res, 200, { ok: true });
  } catch (error) {
    console.error("[results/recent] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
