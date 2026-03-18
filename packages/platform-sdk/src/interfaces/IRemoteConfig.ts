import type { BalanceConfig, FeatureFlags } from "@nametests/core";

export interface IRemoteConfig {
  getFeatureFlags(): Promise<FeatureFlags>;
  getBalanceConfig(): Promise<BalanceConfig>;
}
