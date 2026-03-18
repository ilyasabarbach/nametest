import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IPlatform } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags } from "@nametests/core";

export const facebookPlatform: IPlatform = {
  id: "facebook",
  isOnline: () => true,
  vibrate: () => undefined
};

export const facebookAds: IAds = {
  async canShowRewarded() {
    return false;
  },
  async showRewarded() {
    return "unavailable";
  },
  async showInterstitial() {
    return;
  }
};

export const facebookAnalytics: IAnalytics = {
  track() {
    return;
  }
};

export const facebookRemoteConfig: IRemoteConfig = {
  async getFeatureFlags() {
    return defaultFeatureFlags;
  },
  async getBalanceConfig() {
    return defaultBalanceConfig;
  }
};

export const facebookShare: IShare = {
  async share() {
    return;
  }
};

export const facebookStorage: IStorage = {
  async getItem() {
    return null;
  },
  async setItem() {
    return;
  }
};
