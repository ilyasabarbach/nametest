import { artifactRecipesById } from "@nametests/content-packs";
import type { RemixMode, TestDefinition } from "@nametests/core";

export type ArtifactTemplate = "cosmic" | "spotlight" | "tabloid" | "headline" | "portrait" | "storybook";

export function resolveArtifactTemplate(test: TestDefinition): ArtifactTemplate {
  const recipe = test.artifactRecipeId ? artifactRecipesById.get(test.artifactRecipeId) : undefined;
  if (!recipe) {
    switch (test.art.symbol) {
      case "badge":
        return "spotlight";
      case "storm":
        return "tabloid";
      default:
        return "cosmic";
    }
  }

  switch (recipe.output) {
    case "headline-card":
      return "headline";
    case "portrait":
      return "portrait";
    case "storybook-cover":
      return "storybook";
    case "badge":
      return "spotlight";
    default:
      return recipe.styleFamily.includes("tabloid") ? "tabloid" : "cosmic";
  }
}

function resolvePosterTemplate(test: TestDefinition, fallback: ArtifactTemplate): ArtifactTemplate {
  if (fallback === "tabloid") {
    return "tabloid";
  }

  if (test.styleFamily?.includes("tabloid") || test.styleFamily?.includes("movie") || test.styleFamily?.includes("drama")) {
    return "tabloid";
  }

  return "cosmic";
}

function mapRemixModeToTemplate(mode: RemixMode, test: TestDefinition, fallback: ArtifactTemplate): ArtifactTemplate {
  switch (mode) {
    case "portrait":
      return "portrait";
    case "headline":
      return "headline";
    case "storybook":
      return "storybook";
    case "badge":
      return "spotlight";
    case "poster":
    default:
      return resolvePosterTemplate(test, fallback);
  }
}

export function resolveRemixTemplates(test: TestDefinition): ArtifactTemplate[] {
  const fallback = resolveArtifactTemplate(test);
  const templates: ArtifactTemplate[] = [fallback];

  for (const mode of test.remixModes ?? []) {
    const template = mapRemixModeToTemplate(mode, test, fallback);
    if (!templates.includes(template)) {
      templates.push(template);
    }
  }

  return templates;
}

export function supportsAiArtifactRemix(test: TestDefinition): boolean {
  const recipe = test.artifactRecipeId ? artifactRecipesById.get(test.artifactRecipeId) : undefined;
  return recipe?.engineMode === "ai-optional";
}
