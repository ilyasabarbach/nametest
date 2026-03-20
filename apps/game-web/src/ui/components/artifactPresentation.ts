import { artifactRecipesById } from "@nametests/content-packs";
import type { TestDefinition } from "@nametests/core";

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
