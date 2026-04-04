import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IIdentity } from "../interfaces/IIdentity";
import type { IPlatform } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare, SharePayload } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags, type AnalyticsEvent } from "@nametests/core";

function canUseClipboard(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText);
}

function isLikelyTelegramHost(): boolean {
  const searchParams = new URLSearchParams(window.location.search);
  const hostWindow = window as Window & {
    Telegram?: {
      WebApp?: unknown;
    };
    TelegramWebviewProxy?: unknown;
  };
  return (
    Boolean(hostWindow.Telegram?.WebApp) ||
    Boolean(hostWindow.TelegramWebviewProxy) ||
    searchParams.has("tgWebAppPlatform") ||
    searchParams.has("tgWebAppVersion") ||
    searchParams.has("tgWebAppThemeParams") ||
    /\bTelegram(?:Bot)?\b/i.test(navigator.userAgent || "")
  );
}

function openExternalShareLink(url: string): void {
  try {
    window.location.assign(url);
    return;
  } catch {
    // Fall through.
  }

  window.location.href = url;
}

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
    if (isLikelyTelegramHost() && payload.telegramShareUrl) {
      openExternalShareLink(payload.telegramShareUrl);
      return;
    }

    try {
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
    } catch (error) {
      const shareError = error as DOMException | Error;
      if (payload.telegramShareUrl && (shareError.name === "NotAllowedError" || shareError.name === "AbortError")) {
        openExternalShareLink(payload.telegramShareUrl);
        return;
      }
    }

    if (payload.linkUrl) {
      openExternalShareLink(payload.linkUrl);
      return;
    }

    if (canUseClipboard()) {
      await navigator.clipboard.writeText(payload.text);
    }

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
