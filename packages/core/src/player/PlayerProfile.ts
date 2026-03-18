export type PlayerProfile = {
  id: string;
  displayName: string;
  streak: number;
  lastPlayedAt?: string;
};

export function createAnonymousProfile(displayName = "Guest"): PlayerProfile {
  return {
    id: `guest-${Date.now().toString(36)}`,
    displayName,
    streak: 0
  };
}
