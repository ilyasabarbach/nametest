import { readJsonBody, resolveStartAppState, verifyTelegramInitData, writeJson } from "./_shared.js";

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

    if (req.method !== "GET" && req.method !== "POST") {
      writeJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await readJsonBody(req);
      } catch {
        writeJson(res, 200, { status: "invalid", fallback: true, reason: "invalid_json" });
        return;
      }
    }

    const startapp =
      typeof body?.startapp === "string"
        ? body.startapp
        : typeof req.query?.startapp === "string"
          ? req.query.startapp
          : Array.isArray(req.query?.startapp)
            ? req.query.startapp[0]
            : "";
    const initDataRaw =
      typeof body?.initDataRaw === "string"
        ? body.initDataRaw
        : typeof req.query?.initDataRaw === "string"
          ? req.query.initDataRaw
          : "";

    if (req.method === "POST") {
      if (!initDataRaw) {
        writeJson(res, 200, {
          status: "invalid",
          fallback: true,
          reason: "missing_init_data"
        });
        return;
      }
      const verification = verifyTelegramInitData(initDataRaw);
      if (verification.status !== "verified") {
        writeJson(res, 200, {
          status: "invalid",
          fallback: true,
          reason: `init_${verification.status}`
        });
        return;
      }
    }

    const state = startapp ? resolveStartAppState(startapp) : null;
    if (!state) {
      writeJson(res, 200, { status: "invalid", fallback: true, reason: "missing_or_expired_startapp" });
      return;
    }

    writeJson(res, 200, {
      status: "ok",
      state
    });
  } catch {
    writeJson(res, 200, {
      status: "invalid",
      fallback: true,
      reason: "server_exception"
    });
  }
}
