export const analyticsEventNames = [
  "app_open",
  "test_started",
  "test_completed",
  "reward_prompt_viewed",
  "reward_granted",
  "result_shared"
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
