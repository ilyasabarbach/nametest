import { writeJson, readJsonBody } from "../telegram/_shared.js";
import { saveResultToStore, type StoredResult } from "./_store.js";

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

    let body: any;
    try {
      body = await readJsonBody(req);
    } catch {
      writeJson(res, 400, { error: "invalid_json" });
      return;
    }

    if (!body?.result || typeof body.result !== "object") {
      writeJson(res, 400, { error: "missing_result" });
      return;
    }

    const payload: StoredResult = {
      version: 2,
      testId: String(body.result.testId),
      resultKey: String(body.result.resultKey),
      score: Number(body.result.score) || 0,
      title: String(body.result.title),
      body: String(body.result.body),
      insight: String(body.result.insight),
      hook: String(body.result.hook),
      signature: String(body.result.signature),
      sharePrompt: String(body.result.sharePrompt),
      names: body.result.names,
      template: body.result.template,
      imageRecipeId: body.result.imageRecipeId
    };

    const id = await saveResultToStore(payload);
    writeJson(res, 200, { ok: true, id });
  } catch (error) {
    console.error("[results/save] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
