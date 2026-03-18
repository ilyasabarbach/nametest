import type { TestDefinition } from "../tests/TestDefinition";
import type { PlayerProgress } from "./PlayerProgress";

export function getUnlockedTests(
  tests: TestDefinition[],
  progress: PlayerProgress,
  hiddenTestsEnabled: boolean
): TestDefinition[] {
  return tests.filter((test) => {
    if (test.enabled) {
      return true;
    }

    if (hiddenTestsEnabled) {
      return true;
    }

    return progress.sessionsPlayed >= (test.unlockAfterSessions ?? Number.MAX_SAFE_INTEGER);
  });
}

export function getUnlockedTestIds(tests: TestDefinition[], progress: PlayerProgress, hiddenTestsEnabled: boolean): string[] {
  return getUnlockedTests(tests, progress, hiddenTestsEnabled).map((test) => test.id);
}
