import { decodeSignedStartAppPayload, writeJson } from "./_shared.js";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "GET") {
    writeJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const startapp =
    typeof req.query?.startapp === "string"
      ? req.query.startapp
      : Array.isArray(req.query?.startapp)
        ? req.query.startapp[0]
        : "";
  const state = startapp ? decodeSignedStartAppPayload(startapp) : null;
  if (!state) {
    writeJson(res, 200, { status: "invalid" });
    return;
  }

  writeJson(res, 200, {
    status: "ok",
    state
  });
}
