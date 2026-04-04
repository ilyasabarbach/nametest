import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IIdentity } from "../interfaces/IIdentity";
import type { IPlatform } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags } from "@nametests/core";

export const facebookPlatform: IPlatform = {
  id: "facebook",
  isOnline: () => true,
  vibrate: () => undefined,
  getLaunchContext: () => ({
    source: "unknown",
    platform: "facebook",
    isNativeShell: false
  }),
  getTheme: () => ({
    colorScheme: "light"
  }),
  getViewport: () => ({
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    isExpanded: true
  })
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

export const facebookIdentity: IIdentity = {
  canUseGoogleProfile() {
    return false;
  },
  async connectGoogleProfile() {
    return null;
  },
  async disconnectGoogleProfile() {
    return;
  },
  async getPlatformProfile() {
    return null;
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
  },
  canShareToStory() {
    return false;
  },
  async shareToStory() {
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
