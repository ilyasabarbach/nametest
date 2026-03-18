import { createServer } from "node:http";
import { getFallbackDiscoveryFeedPage, type HomeFeedLocale } from "@nametests/content-packs";
import { isDiscoveryFeedPagePayload } from "@nametests/backend-contracts";

const DEFAULT_PORT = 8787;
const allowedLocales: HomeFeedLocale[] = ["en", "fr", "es", "de", "ar", "pt"];

function resolveLocale(input: string | null): HomeFeedLocale {
  return allowedLocales.find((locale) => locale === input) ?? "en";
}

function writeJson(response: import("node:http").ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(body));
}

function handleFeedRequest(requestUrl: URL, response: import("node:http").ServerResponse): void {
  const locale = resolveLocale(requestUrl.searchParams.get("locale"));
  const cursor = requestUrl.searchParams.get("cursor") ?? undefined;
  const payload = getFallbackDiscoveryFeedPage(locale, cursor);

  if (!isDiscoveryFeedPagePayload(payload)) {
    writeJson(response, 500, { error: "invalid_payload" });
    return;
  }

  writeJson(response, 200, payload);
}

const server = createServer((request, response) => {
  if (!request.url) {
    writeJson(response, 400, { error: "missing_url" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, "http://localhost");

  if (request.method === "GET" && (requestUrl.pathname === "/health" || requestUrl.pathname === "/api/health")) {
    writeJson(response, 200, {
      status: "ok",
      service: "discovery-feed-api",
      now: new Date().toISOString()
    });
    return;
  }

  if (request.method === "GET" && (requestUrl.pathname === "/discovery-feed" || requestUrl.pathname === "/api/discovery-feed")) {
    handleFeedRequest(requestUrl, response);
    return;
  }

  writeJson(response, 404, { error: "not_found" });
});

const port = Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10) || DEFAULT_PORT;

server.listen(port, () => {
  console.log(`Discovery feed API listening on http://localhost:${port}`);
});
