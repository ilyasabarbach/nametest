import type { RewardOutcome } from "@nametests/core";

export interface IAds {
  canShowRewarded(): Promise<boolean>;
  showRewarded(): Promise<RewardOutcome>;
  showInterstitial(): Promise<void>;
}
