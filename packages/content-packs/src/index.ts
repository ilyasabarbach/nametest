import type { ContentManifest, TestDefinition } from "@nametests/core";
import manifest from "./manifests/default.manifest.json";
import dramaMeter from "./tests/drama-meter.json";
import fameLevel from "./tests/fame-level.json";
import loveMatch from "./tests/love-match.json";
import friendshipScore from "./tests/friendship-score.json";
import futureCareer from "./tests/future-career.json";
import secretCrush from "./tests/secret-crush.json";
import starAura from "./tests/star-aura.json";
import weddingBells from "./tests/wedding-bells.json";
import common from "./copy/en/common.json";
import tests from "./copy/en/tests.json";
import results from "./copy/en/results.json";

export const defaultManifest = manifest as ContentManifest;
export const defaultTests = [
  loveMatch,
  weddingBells,
  friendshipScore,
  secretCrush,
  futureCareer,
  dramaMeter,
  starAura,
  fameLevel
] as TestDefinition[];
export const enCopy: Record<string, string> = {
  ...common,
  ...tests,
  ...results
};
