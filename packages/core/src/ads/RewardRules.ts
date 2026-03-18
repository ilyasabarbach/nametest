import type { TestRunResult } from "../tests/TestRunner";
import type { RewardState } from "../progression/RewardState";

export function canUnlockAlternateResult(result: TestRunResult, rewardState: RewardState): boolean {
  return result.score >= 40 && !rewardState.alternateResultUnlocked;
}
