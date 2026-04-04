import { readJsonBody, verifyTelegramInitData, writeJson } from "./_shared";

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

  if (!payload || typeof payload.initDataRaw !== "string") {
    writeJson(res, 400, { error: "invalid_payload" });
    return;
  }

  writeJson(res, 200, verifyTelegramInitData(payload.initDataRaw));
}
