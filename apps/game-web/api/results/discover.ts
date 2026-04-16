import { writeJson } from "../telegram/_shared.js";
import { getDiscoverFeedFromStore, getRecentResultsFromStore } from "./_store.js";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req: any, res: any): Promise<void> {
  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.end();
      return;
    }

    if (req.method !== "GET") {
      writeJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    const [feed, recentResults] = await Promise.all([
      getDiscoverFeedFromStore(),
      getRecentResultsFromStore(10)
    ]);
    writeJson(res, 200, { items: feed, recentResults });
  } catch (error) {
    console.error("[results/discover] exception", error);
    writeJson(res, 500, { error: "server_exception" });
  }
}
