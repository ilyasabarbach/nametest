import type { IAds, IAnalytics, IIdentity, IPlatform, IRemoteConfig, IShare, IStorage } from "@nametests/platform-sdk";
import {
  browserAds,
  browserAnalytics,
  browserIdentity,
  browserPlatform,
  browserRemoteConfig,
  browserShare,
  browserStorage
} from "./browser";
import {
  capacitorAds,
  capacitorAnalytics,
  createCapacitorIdentity,
  capacitorPlatform,
  capacitorRemoteConfig,
  capacitorShare,
  capacitorStorage
} from "./android";
import {
  facebookAds,
  facebookAnalytics,
  facebookIdentity,
  facebookPlatform,
  facebookRemoteConfig,
  facebookShare,
  facebookStorage
} from "./facebook";
import {
  telegramAds,
  telegramAnalytics,
  telegramIdentity,
  telegramPlatform,
  telegramRemoteConfig,
  telegramShare,
  telegramStorage
} from "./telegram";

export type PlatformId = IPlatform["id"];

export type PlatformServices = {
  platform: IPlatform;
  ads: IAds;
  analytics: IAnalytics;
  identity: IIdentity;
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

  if (envPlatform === "telegram") {
    return "telegram";
  }

  const hostWindow = window as Window & {
    FBInstant?: unknown;
    Telegram?: {
      WebApp?: unknown;
    };
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  };

  if (hostWindow.FBInstant) {
    return "facebook";
  }

  if (hostWindow.Telegram?.WebApp) {
    return "telegram";
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
        identity: createCapacitorIdentity({
          googleWebClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined
        }),
        remoteConfig: capacitorRemoteConfig,
        share: capacitorShare,
        storage: capacitorStorage
      };
    case "facebook":
      return {
        platform: facebookPlatform,
        ads: facebookAds,
        analytics: facebookAnalytics,
        identity: facebookIdentity,
        remoteConfig: facebookRemoteConfig,
        share: facebookShare,
        storage: facebookStorage
      };
    case "telegram":
      return {
        platform: telegramPlatform,
        ads: telegramAds,
        analytics: telegramAnalytics,
        identity: telegramIdentity,
        remoteConfig: telegramRemoteConfig,
        share: telegramShare,
        storage: telegramStorage
      };
    case "browser":
    default:
      return {
        platform: browserPlatform,
        ads: browserAds,
        analytics: browserAnalytics,
        identity: browserIdentity,
        remoteConfig: browserRemoteConfig,
        share: browserShare,
        storage: browserStorage
      };
  }
}
