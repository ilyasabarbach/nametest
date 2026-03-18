import type { TestRunResult } from "../tests/TestRunner";
import type { PlayerProgress } from "./PlayerProgress";

export function addResultToCollection(progress: PlayerProgress, result: TestRunResult): PlayerProgress {
  const nextCollection = Array.from(new Set([...progress.collectedResultKeys, result.resultKey]));
  return {
    ...progress,
    collectedResultKeys: nextCollection
  };
}
