import type { IAds, IAnalytics, IPlatform, IRemoteConfig, IShare, IStorage } from "@nametests/platform-sdk";
import {
  browserAds,
  browserAnalytics,
  browserPlatform,
  browserRemoteConfig,
  browserShare,
  browserStorage
} from "./browser";
import {
  capacitorAds,
  capacitorAnalytics,
  capacitorPlatform,
  capacitorRemoteConfig,
  capacitorShare,
  capacitorStorage
} from "./android";
import {
  facebookAds,
  facebookAnalytics,
  facebookPlatform,
  facebookRemoteConfig,
  facebookShare,
  facebookStorage
} from "./facebook";

export type PlatformId = IPlatform["id"];

export type PlatformServices = {
  platform: IPlatform;
  ads: IAds;
  analytics: IAnalytics;
  remoteConfig: IRemoteConfig;
  share: IShare;
  storage: IStorage;
};

function detectPlatform(): PlatformId {
  const envPlatform = (import.meta.env.VITE_TARGET_PLATFORM as string | undefined)?.toLowerCase();
  if (envPlatform === "facebook") {
    return "facebook";
  }

  if (envPlatform === "android") {
    return "android";
  }

  const hostWindow = window as Window & {
    FBInstant?: unknown;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  };

  if (hostWindow.FBInstant) {
    return "facebook";
  }

  if (hostWindow.Capacitor?.isNativePlatform?.() || hostWindow.Capacitor?.getPlatform?.() === "android") {
    return "android";
  }

  return "browser";
}

export function resolvePlatformServices(platformId = detectPlatform()): PlatformServices {
  switch (platformId) {
    case "android":
      return {
        platform: capacitorPlatform,
        ads: capacitorAds,
        analytics: capacitorAnalytics,
        remoteConfig: capacitorRemoteConfig,
        share: capacitorShare,
        storage: capacitorStorage
      };
    case "facebook":
      return {
        platform: facebookPlatform,
        ads: facebookAds,
        analytics: facebookAnalytics,
        remoteConfig: facebookRemoteConfig,
        share: facebookShare,
        storage: facebookStorage
      };
    case "browser":
    default:
      return {
        platform: browserPlatform,
        ads: browserAds,
        analytics: browserAnalytics,
        remoteConfig: browserRemoteConfig,
        share: browserShare,
        storage: browserStorage
      };
  }
}
