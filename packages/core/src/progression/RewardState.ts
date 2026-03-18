export type RewardState = {
  rewardedSeen: boolean;
  alternateResultUnlocked: boolean;
};

export function createRewardState(): RewardState {
  return {
    rewardedSeen: false,
    alternateResultUnlocked: false
  };
}
