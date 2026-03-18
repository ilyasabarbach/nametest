import type { ContentManifest } from "./ContentManifest";
import type { TestDefinition } from "../tests/TestDefinition";
import { seededIndex } from "../utils/random";

export function selectDailyFeaturedTest(manifest: ContentManifest, tests: TestDefinition[], dateKey: string): TestDefinition {
  const pool = tests.filter((test) => manifest.testIds.includes(test.id));
  const index = seededIndex(`${manifest.version}:${dateKey}`, pool.length);
  return pool[index] ?? tests[0];
}
