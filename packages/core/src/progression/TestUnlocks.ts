import type { TestDefinition } from "../tests/TestDefinition";
import type { PlayerProgress } from "./PlayerProgress";

export type NextUnlockTarget = {
  testId: string;
  unlockAtSessions: number;
  sessionsRemaining: number;
};

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

export function getNextUnlockTarget(
  tests: TestDefinition[],
  progress: PlayerProgress,
  hiddenTestsEnabled: boolean
): NextUnlockTarget | null {
  if (hiddenTestsEnabled) {
    return null;
  }

  const nextLockedTest = tests
    .filter((test) => !test.enabled && progress.sessionsPlayed < (test.unlockAfterSessions ?? Number.MAX_SAFE_INTEGER))
    .sort((left, right) => (left.unlockAfterSessions ?? Number.MAX_SAFE_INTEGER) - (right.unlockAfterSessions ?? Number.MAX_SAFE_INTEGER))[0];

  if (!nextLockedTest || nextLockedTest.unlockAfterSessions === undefined) {
    return null;
  }

  return {
    testId: nextLockedTest.id,
    unlockAtSessions: nextLockedTest.unlockAfterSessions,
    sessionsRemaining: Math.max(0, nextLockedTest.unlockAfterSessions - progress.sessionsPlayed)
  };
}
