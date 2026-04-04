import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IIdentity } from "../interfaces/IIdentity";
import type { IPlatform } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare, SharePayload } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags, type AnalyticsEvent } from "@nametests/core";

export const browserPlatform: IPlatform = {
  id: "browser",
  isOnline: () => navigator.onLine,
  vibrate: (milliseconds) => navigator.vibrate?.(milliseconds),
  getLaunchContext: () => ({
    source: "unknown",
    startParam: new URLSearchParams(window.location.search).get("startapp") ?? undefined,
    platform: "browser",
    isNativeShell: false
  }),
  getTheme: () => ({
    colorScheme: window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light"
  }),
  getViewport: () => ({
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    isExpanded: true
  })
};

export const browserAds: IAds = {
  async canShowRewarded() {
    return true;
  },
  async showRewarded() {
    return "granted";
  },
  async showInterstitial() {
    return;
  }
};

export const browserAnalytics: IAnalytics = {
  track(event: AnalyticsEvent) {
    console.info("[analytics]", event.name, event.payload);
  }
};

export const browserIdentity: IIdentity = {
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

export const browserRemoteConfig: IRemoteConfig = {
  async getFeatureFlags() {
    return defaultFeatureFlags;
  },
  async getBalanceConfig() {
    return defaultBalanceConfig;
  }
};

export const browserShare: IShare = {
  async share(payload: SharePayload) {
    if (navigator.share && payload.imageDataUrl) {
      const response = await fetch(payload.imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], payload.filename ?? "nametests-card.png", { type: "image/png" });

      if ("canShare" in navigator && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ text: payload.text, title: payload.title, files: [file] });
        return;
      }
    }

    if (navigator.share) {
      await navigator.share({ text: payload.text, title: payload.title });
      return;
    }

    await navigator.clipboard.writeText(payload.text);
    if (payload.imageDataUrl) {
      const anchor = document.createElement("a");
      anchor.href = payload.imageDataUrl;
      anchor.download = payload.filename ?? "nametests-card.png";
      anchor.click();
    }
  },
  canShareToStory() {
    return false;
  },
  async shareToStory(payload: SharePayload) {
    await browserShare.share(payload);
  }
};

export const browserStorage: IStorage = {
  async getItem(key) {
    return window.localStorage.getItem(key);
  },
  async setItem(key, value) {
    window.localStorage.setItem(key, value);
  }
};
