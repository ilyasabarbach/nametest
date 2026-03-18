export type StreakState = {
  current: number;
  lastPlayDate?: string;
};

export function updateStreak(state: StreakState, currentDate: string): StreakState {
  if (state.lastPlayDate === currentDate) {
    return state;
  }

  return {
    current: state.lastPlayDate ? state.current + 1 : 1,
    lastPlayDate: currentDate
  };
}
