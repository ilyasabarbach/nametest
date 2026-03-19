import type { SessionState } from "./SessionState";
import { createRewardState } from "../progression/RewardState";

export function createReplayState(state: SessionState, partnerName: string): SessionState {
  return {
    ...state,
    names: {
      ...state.names,
      partnerName
    },
    inputValues: {
      ...state.inputValues,
      partnerName
    },
    latestResult: undefined,
    progressSummary: undefined,
    rewardState: createRewardState()
  };
}
