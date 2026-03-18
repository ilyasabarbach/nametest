import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Share } from "@capacitor/share";
import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IPlatform, PlatformLifecycleHooks } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare, SharePayload } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags, type AnalyticsEvent } from "@nametests/core";
import { browserShare } from "../browser";

const storagePrefix = "nametests:";

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

function storageKey(key: string): string {
  return `${storagePrefix}${key}`;
}

export const capacitorPlatform: IPlatform = {
  id: "android",
  isOnline: () => navigator.onLine,
  vibrate: (milliseconds) => navigator.vibrate?.(milliseconds),
  async installLifecycle(hooks: PlatformLifecycleHooks) {
    if (!isNativeAndroid()) {
      return;
    }

    const appStateListener = await App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        hooks.resumeGame();
        return;
      }

      hooks.pauseGame();
    });

    const pauseListener = await App.addListener("pause", () => {
      hooks.pauseGame();
    });

    const resumeListener = await App.addListener("resume", () => {
      hooks.resumeGame();
    });

    const backButtonListener = await App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) {
        window.history.back();
        return;
      }

      if (hooks.canExitApp()) {
        void App.exitApp();
        return;
      }

      hooks.navigateHome();
    });

    return () => {
      appStateListener.remove();
      pauseListener.remove();
      resumeListener.remove();
      backButtonListener.remove();
    };
  }
};

export const capacitorAds: IAds = {
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

export const capacitorAnalytics: IAnalytics = {
  track(event: AnalyticsEvent) {
    console.info("[analytics:android]", event.name, event.payload);
  }
};

export const capacitorRemoteConfig: IRemoteConfig = {
  async getFeatureFlags() {
    return defaultFeatureFlags;
  },
  async getBalanceConfig() {
    return defaultBalanceConfig;
  }
};

async function shareWithCapacitor(payload: SharePayload): Promise<void> {
  await Share.share({
    title: payload.title,
    text: payload.text,
    dialogTitle: payload.title ?? "Share result"
  });
}

export const capacitorShare: IShare = {
  async share(payload: SharePayload) {
    if (isNativeAndroid()) {
      try {
        await shareWithCapacitor(payload);
        return;
      } catch {
        // Fall back to the browser path when the native share plugin is unavailable.
      }
    }

    await browserShare.share(payload);
  }
};

export const capacitorStorage: IStorage = {
  async getItem(key) {
    if (isNativeAndroid()) {
      try {
        const result = await Preferences.get({ key: storageKey(key) });
        return result.value;
      } catch {
        return window.localStorage.getItem(key);
      }
    }

    return window.localStorage.getItem(key);
  },

  async setItem(key, value) {
    if (isNativeAndroid()) {
      try {
        await Preferences.set({ key: storageKey(key), value });
        return;
      } catch {
        window.localStorage.setItem(key, value);
        return;
      }
    }

    window.localStorage.setItem(key, value);
  }
};
