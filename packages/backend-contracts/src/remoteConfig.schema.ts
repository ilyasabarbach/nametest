import type { BalanceConfig, FeatureFlags } from "@nametests/core";

export type RemoteConfigPayload = {
  featureFlags: FeatureFlags;
  balance: BalanceConfig;
  featuredTestId: string;
};

export function isRemoteConfigPayload(value: unknown): value is RemoteConfigPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.featuredTestId === "string" && typeof payload.featureFlags === "object" && typeof payload.balance === "object";
}
