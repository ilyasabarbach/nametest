import { toDateKey } from "../utils/time";
import type { PlayerProgress } from "./PlayerProgress";

export type DailyRewardResult = {
  progress: PlayerProgress;
  claimed: boolean;
  rewardCoins: number;
};

export function claimDailyReward(progress: PlayerProgress, date: Date): DailyRewardResult {
  const dayKey = toDateKey(date);
  if (progress.lastDailyRewardDate === dayKey) {
    return {
      progress,
      claimed: false,
      rewardCoins: 0
    };
  }

  const rewardCoins = progress.streak >= 6 ? 40 : progress.streak >= 3 ? 25 : 15;

  return {
    claimed: true,
    rewardCoins,
    progress: {
      ...progress,
      rewardCoins: progress.rewardCoins + rewardCoins,
      lastDailyRewardDate: dayKey
    }
  };
}
