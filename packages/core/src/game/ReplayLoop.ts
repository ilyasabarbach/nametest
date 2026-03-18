import type { SessionState } from "./SessionState";
import { createRewardState } from "../progression/RewardState";

export function createReplayState(state: SessionState, partnerName: string): SessionState {
  return {
    ...state,
    names: {
      ...state.names,
      partnerName
    },
    latestResult: undefined,
    rewardState: createRewardState()
  };
}
