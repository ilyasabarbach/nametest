import type { FeatureFlags } from "../config/FeatureFlags";
import type { SessionState } from "./SessionState";
import type { TestDefinition } from "../tests/TestDefinition";
import { TestRunner, type TestInputValue, type TestRunInput } from "../tests/TestRunner";
import { createRewardState } from "../progression/RewardState";
import { addResultToCollection, createPlayerProgress, getUnlockedTestIds, updateProgressAfterSession } from "../progression";

export class GameFlow {
  private readonly runner = new TestRunner();

  constructor(private flags: FeatureFlags) {}

  setFlags(flags: FeatureFlags): void {
    this.flags = flags;
  }

  createSession(
    selectedTest: TestDefinition,
    primaryName = "",
    partnerName = "",
    inputValues?: Record<string, TestInputValue>
  ): SessionState {
    return {
      selectedTest,
      names: { primaryName, partnerName },
      inputValues: inputValues ?? {
        primaryName,
        partnerName
      },
      rewardState: createRewardState(),
      playerProgress: createPlayerProgress(),
      progressSummary: undefined
    };
  }

  runSession(state: SessionState, input: TestRunInput, allTests: TestDefinition[], currentDate = new Date()): SessionState {
    const previouslyUnlockedIds = new Set(state.playerProgress.unlockedTestIds);
    const previouslyCollectedResults = new Set(state.playerProgress.collectedResultKeys);
    const latestResult = this.runner.run(state.selectedTest, input);
    const nextProgress = updateProgressAfterSession(
      state.playerProgress,
      currentDate,
      state.playerProgress.unlockedTestIds,
      latestResult.resultKey
    );
    const unlockedTestIds = getUnlockedTestIds(allTests, nextProgress, this.flags.hiddenTestsEnabled);
    const collectedProgress = addResultToCollection(nextProgress, latestResult);

    return {
      ...state,
      latestResult,
      progressSummary: {
        newlyUnlockedTestIds: unlockedTestIds.filter((testId) => !previouslyUnlockedIds.has(testId)),
        newlyCollectedResultKey: previouslyCollectedResults.has(latestResult.resultKey) ? undefined : latestResult.resultKey
      },
      playerProgress: {
        ...collectedProgress,
        unlockedTestIds
      }
    };
  }

  isRewardEnabled(): boolean {
    return this.flags.adsEnabled;
  }
}
