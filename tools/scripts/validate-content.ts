import { defaultManifest, defaultTests } from "../../packages/content-packs/src/index";
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
}

console.log(`Validated ${defaultTests.length} test definitions.`);
