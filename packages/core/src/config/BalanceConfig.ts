export type BalanceConfig = {
  interstitialEvery: number;
  rewardUnlockThreshold: number;
};

export const defaultBalanceConfig: BalanceConfig = {
  interstitialEvery: 3,
  rewardUnlockThreshold: 40
};
