import type { RewardState } from "../progression/RewardState";
import type { PlayerProgress } from "../progression/PlayerProgress";
import type { TestDefinition } from "../tests/TestDefinition";
import type { TestInputValue, TestRunResult } from "../tests/TestRunner";

export type SessionProgressSummary = {
  newlyUnlockedTestIds: string[];
  newlyCollectedResultKey?: string;
};

export type SessionState = {
  selectedTest: TestDefinition;
  names: {
    primaryName: string;
    partnerName: string;
  };
  inputValues: Record<string, TestInputValue>;
  latestResult?: TestRunResult;
  rewardState: RewardState;
  playerProgress: PlayerProgress;
  progressSummary?: SessionProgressSummary;
  dailyFeaturedTestId?: string;
};
