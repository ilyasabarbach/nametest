export type AnalyticsEvent =
  | { name: "app_open"; payload: { source: string } }
  | { name: "test_started"; payload: { testId: string } }
  | { name: "test_completed"; payload: { testId: string; score: number; resultKey: string } }
  | { name: "reward_prompt_viewed"; payload: { testId: string; score: number } }
  | { name: "reward_granted"; payload: { testId: string } }
  | { name: "result_shared"; payload: { testId: string; resultKey: string } };
