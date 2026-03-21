export type ArtifactRemixTemplate = "cosmic" | "spotlight" | "tabloid" | "headline" | "portrait" | "storybook";

export type ArtifactRemixRequest = {
  testId: string;
  recipeId: string;
  imageRecipeId?: string;
  locale: string;
  template: ArtifactRemixTemplate;
  names: {
    primaryName: string;
    partnerName: string;
  };
  result: {
    resultKey: string;
    score: string;
    hook: string;
    title: string;
    body: string;
    insight: string;
    signature: string;
    sharePrompt: string;
  };
};

export type ArtifactRemixResponse = {
  status: "ok";
  mode: "synthetic-preview" | "fallback";
  template: ArtifactRemixTemplate;
  artifact: {
    hook: string;
    title: string;
    body: string;
    insight: string;
    signature: string;
    sharePrompt: string;
    accent?: string;
    badgeLabel?: string;
    posterImageDataUrl?: string;
  };
};

export function isArtifactRemixRequest(value: unknown): value is ArtifactRemixRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.testId === "string" &&
    typeof payload.recipeId === "string" &&
    typeof payload.locale === "string" &&
    typeof payload.template === "string" &&
    typeof payload.names === "object" &&
    typeof payload.result === "object"
  );
}

export function isArtifactRemixResponse(value: unknown): value is ArtifactRemixResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    payload.status === "ok" &&
    (payload.mode === "synthetic-preview" || payload.mode === "fallback") &&
    typeof payload.template === "string" &&
    typeof payload.artifact === "object"
  );
}
