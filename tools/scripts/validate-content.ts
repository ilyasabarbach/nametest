import { artifactRecipesById, defaultManifest, defaultTests, generatedImageRecipesById } from "../../packages/content-packs/src/index";
import { isContentManifest } from "../../packages/backend-contracts/src/contentManifest.schema";

if (!isContentManifest(defaultManifest)) {
  throw new Error("Invalid default content manifest.");
}

for (const test of defaultTests) {
  if (!defaultManifest.testIds.includes(test.id)) {
    throw new Error(`Test ${test.id} is missing from manifest.`);
  }

  if (test.resultBands.length === 0) {
    throw new Error(`Test ${test.id} has no result bands.`);
  }

  if (test.artifactRecipeId && !artifactRecipesById.has(test.artifactRecipeId)) {
    throw new Error(`Test ${test.id} references unknown artifact recipe ${test.artifactRecipeId}.`);
  }

  if (test.imageRecipeId && !generatedImageRecipesById.has(test.imageRecipeId)) {
    throw new Error(`Test ${test.id} references unknown image recipe ${test.imageRecipeId}.`);
  }

  if (test.thumbnailRecipeId && !generatedImageRecipesById.has(test.thumbnailRecipeId)) {
    throw new Error(`Test ${test.id} references unknown thumbnail recipe ${test.thumbnailRecipeId}.`);
  }

  if (test.inputMode === "pair-name" && !test.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName")) {
    throw new Error(`Test ${test.id} is marked pair-name but has no partnerName prompt.`);
  }

  if (test.inputMode === "single-name" && !test.prompts.some((prompt) => prompt.type === "name" && prompt.id === "primaryName")) {
    throw new Error(`Test ${test.id} is marked single-name but has no primaryName prompt.`);
  }

  if (test.inputMode === "tap-photo" && test.prompts.some((prompt) => prompt.type === "name")) {
    throw new Error(`Test ${test.id} is marked tap-photo but still contains name prompts.`);
  }
}

console.log(`Validated ${defaultTests.length} test definitions.`);
