import type { AnalyticsEvent } from "./AnalyticsEvents";

export interface AnalyticsService {
  track(event: AnalyticsEvent): void | Promise<void>;
}
