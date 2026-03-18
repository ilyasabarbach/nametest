export type DiscoveryFeedLocale = "en" | "fr" | "es" | "de" | "ar" | "pt";

export type DiscoveryFeedItemPayload = {
  id: string;
  testId: string;
  imageKey: string;
  hot: boolean;
  tag: string;
  title: string;
  teaser: string;
  socialProof: string;
  palette: [string, string];
};

export type DiscoveryFeedPagePayload = {
  locale: DiscoveryFeedLocale;
  items: DiscoveryFeedItemPayload[];
  nextCursor?: string;
  generatedAt: string;
};

export function isDiscoveryFeedPagePayload(value: unknown): value is DiscoveryFeedPagePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.locale === "string" && Array.isArray(payload.items) && typeof payload.generatedAt === "string";
}
