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
import destinyHeadline from "./tests/destiny-headline.json";
import pastLifeEcho from "./tests/past-life-echo.json";
import hiddenGift from "./tests/hidden-gift.json";
import auraPalette from "./tests/aura-palette.json";
import groupChatRole from "./tests/group-chat-role.json";
import soulStory from "./tests/soul-story.json";
import photoArchetype from "./tests/photo-archetype.json";
import moviePoster from "./tests/movie-poster.json";
import common from "./copy/en/common.json";
import tests from "./copy/en/tests.json";
import results from "./copy/en/results.json";
export * from "./discovery/homeFeed";
export * from "./discovery/feedFallback";
export * from "./artifacts/recipes";
export * from "./artifacts/imageRecipes";
export * from "./artifacts/generatedArt";
export * from "./copy";

export const defaultManifest = manifest as ContentManifest;
export const defaultTests = [
  loveMatch,
  weddingBells,
  friendshipScore,
  secretCrush,
  futureCareer,
  dramaMeter,
  starAura,
  fameLevel,
  destinyHeadline,
  pastLifeEcho,
  hiddenGift,
  auraPalette,
  groupChatRole,
  soulStory,
  photoArchetype,
  moviePoster
] as TestDefinition[];
export const enCopy: Record<string, string> = {
  ...common,
  ...tests,
  ...results
};
