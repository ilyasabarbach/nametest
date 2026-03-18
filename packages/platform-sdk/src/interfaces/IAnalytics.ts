import type { AnalyticsEvent } from "@nametests/core";

export interface IAnalytics {
  track(event: AnalyticsEvent): void | Promise<void>;
}
