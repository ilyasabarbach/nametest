import { randomUUID } from "node:crypto";

export type StoredResult = {
  version: 2;
  testId: string;
  resultKey: string;
  score: number;
  title: string;
  body: string;
  insight: string;
  hook: string;
  signature: string;
  sharePrompt: string;
  names?: { primaryName: string; partnerName?: string };
  template?: string;
  imageRecipeId?: string;
  creatorId?: string;
};

export type DiscoverFeedItem = {
  name: string;
  title: string;
  accent?: string;
  id: string;
  testId: string;
};

// Fallback in-memory map for local development if KV is missing
const memoryStore = new Map<string, { result: StoredResult; expiresAt: number }>();
const memoryDiscoverFeed: DiscoverFeedItem[] = [];
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function saveResultToStore(result: StoredResult): Promise<string> {
  const shortHash = randomUUID().replace(/-/g, "").slice(0, 8);
  const id = `rs_${shortHash}`;

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  const feedItem: DiscoverFeedItem = {
    name: result.names?.primaryName || "Guest",
    title: result.title,
    accent: result.template || "cosmic",
    id,
    testId: result.testId
  };

  if (kvUrl && kvToken) {
    try {
      const response = await fetch(`${kvUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([
          ["SET", id, JSON.stringify(result), "EX", 30 * 24 * 60 * 60],
          ["LPUSH", "global_discover_feed", JSON.stringify(feedItem)],
          ["LTRIM", "global_discover_feed", 0, 9]
        ])
      });
      if (!response.ok) {
        console.warn("[kv-store] Failed to save result to KV Pipeline", await response.text());
      }
    } catch (e) {
      console.warn("[kv-store] KV fetch exception", e);
    }
  } else {
    // Fallback locally
    memoryStore.set(id, {
      result,
      expiresAt: Date.now() + TTL_MS
    });
    memoryDiscoverFeed.unshift(feedItem);
    if (memoryDiscoverFeed.length > 10) {
      memoryDiscoverFeed.pop();
    }
    // Cleanup old items occasionally
    if (memoryStore.size > 1000) {
      for (const [key, entry] of memoryStore.entries()) {
        if (entry.expiresAt <= Date.now()) {
          memoryStore.delete(key);
        }
      }
    }
  }

  return id;
}

export async function getResultFromStore(id: string): Promise<StoredResult | null> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const response = await fetch(`${kvUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["GET", id])
      });
      if (response.ok) {
        const body = (await response.json()) as { result?: string | null };
        if (body && body.result) {
          return typeof body.result === "string" ? JSON.parse(body.result) : body.result;
        }
      }
    } catch (e) {
      console.warn("[kv-store] KV fetch exception during get", e);
    }
  } else {
    const entry = memoryStore.get(id);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.result;
    }
    if (entry) {
      memoryStore.delete(id);
    }
  }

  return null;
}

export async function getDiscoverFeedFromStore(): Promise<DiscoverFeedItem[]> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const response = await fetch(`${kvUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["LRANGE", "global_discover_feed", 0, 9])
      });
      if (response.ok) {
        const body = (await response.json()) as { result?: string[] | null };
        if (body && Array.isArray(body.result)) {
          return body.result.map(item => JSON.parse(item) as DiscoverFeedItem);
        }
      }
    } catch (e) {
      console.warn("[kv-store] KV fetch exception during getDiscoverFeed", e);
    }
  } else {
    return memoryDiscoverFeed;
  }

  return [];
}
