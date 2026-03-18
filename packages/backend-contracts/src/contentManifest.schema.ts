import type { ContentManifest } from "@nametests/core";

export function isContentManifest(value: unknown): value is ContentManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Record<string, unknown>;
  return (
    typeof manifest.version === "string" &&
    typeof manifest.defaultLocale === "string" &&
    typeof manifest.featuredTestId === "string" &&
    Array.isArray(manifest.testIds)
  );
}
