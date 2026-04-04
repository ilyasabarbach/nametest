export type AnalyticsEvent =
  | { name: "app_open"; payload: { source: string } }
  | { name: "launch_resolved"; payload: { platform: string; source: string; startParam?: string; testId?: string } }
  | { name: "test_started"; payload: { testId: string } }
  | { name: "test_completed"; payload: { testId: string; score: number; resultKey: string } }
  | { name: "reward_prompt_viewed"; payload: { testId: string; score: number } }
  | { name: "reward_granted"; payload: { testId: string } }
  | { name: "result_shared"; payload: { testId: string; resultKey: string } }
  | { name: "share_started"; payload: { platform: string; surface: string; testId: string; resultKey: string } }
  | { name: "share_sent"; payload: { platform: string; surface: string; testId: string; resultKey: string } }
  | { name: "share_returned"; payload: { platform: string; surface: string; testId: string; resultKey: string } };
