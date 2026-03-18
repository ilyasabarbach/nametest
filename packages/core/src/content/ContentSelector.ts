import type { ContentManifest } from "./ContentManifest";
import type { TestDefinition } from "../tests/TestDefinition";

export function selectFeaturedTest(manifest: ContentManifest, tests: TestDefinition[]): TestDefinition {
  return tests.find((test) => test.id === manifest.featuredTestId) ?? tests[0];
}
