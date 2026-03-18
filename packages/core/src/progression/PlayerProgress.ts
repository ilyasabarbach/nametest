import { toDateKey } from "../utils/time";

export type PlayerProgress = {
  sessionsPlayed: number;
  streak: number;
  lastPlayedDate?: string;
  lastDailyRewardDate?: string;
  unlockedTestIds: string[];
  rewardCoins: number;
  collectedResultKeys: string[];
  favoriteResultKey?: string;
};

export function createPlayerProgress(): PlayerProgress {
  return {
    sessionsPlayed: 0,
    streak: 0,
    unlockedTestIds: [],
    rewardCoins: 0,
    collectedResultKeys: []
  };
}

export function updateProgressAfterSession(
  progress: PlayerProgress,
  date: Date,
  unlockedTestIds: string[],
  latestResultKey?: string
): PlayerProgress {
  const currentDate = toDateKey(date);
  const alreadyPlayedToday = progress.lastPlayedDate === currentDate;

  return {
    ...progress,
    sessionsPlayed: progress.sessionsPlayed + 1,
    streak: alreadyPlayedToday ? progress.streak : progress.streak + 1,
    lastPlayedDate: currentDate,
    unlockedTestIds,
    favoriteResultKey: latestResultKey ?? progress.favoriteResultKey
  };
}
