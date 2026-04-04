import type { IAds } from "../interfaces/IAds";
import type { IAnalytics } from "../interfaces/IAnalytics";
import type { IIdentity, SocialProfile } from "../interfaces/IIdentity";
import type { IPlatform, PlatformLaunchContext, PlatformTheme, PlatformViewport } from "../interfaces/IPlatform";
import type { IRemoteConfig } from "../interfaces/IRemoteConfig";
import type { IShare, SharePayload } from "../interfaces/IShare";
import type { IStorage } from "../interfaces/IStorage";
import { defaultBalanceConfig, defaultFeatureFlags, type AnalyticsEvent } from "@nametests/core";
import { browserShare, browserStorage } from "../browser";

type TelegramWebAppUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
};

type TelegramCloudStorage = {
  getItem(key: string, callback: (error: unknown, value: string | null) => void): void;
  setItem(key: string, value: string, callback: (error: unknown, success: boolean) => void): void;
  removeItem?(key: string, callback: (error: unknown, success: boolean) => void): void;
};

type TelegramButton = {
  show(): void;
  hide(): void;
  onClick?(listener: () => void): void;
  offClick?(listener: () => void): void;
};

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    start_param?: string;
    user?: TelegramWebAppUser;
  };
  platform?: string;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  ready?(): void;
  expand?(): void;
  requestFullscreen?(): Promise<void> | void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  openTelegramLink?(url: string): void;
  openLink?(url: string, options?: Record<string, unknown>): void;
  shareToStory?(mediaUrl: string, params?: Record<string, unknown>): void;
  shareMessage?(messageId: string, callback?: (sent: boolean) => void): void;
  onEvent?(event: string, listener: (...args: unknown[]) => void): void;
  offEvent?(event: string, listener: (...args: unknown[]) => void): void;
  BackButton?: TelegramButton;
  SettingsButton?: TelegramButton;
  HapticFeedback?: {
    impactOccurred?(style: "light" | "medium" | "heavy" | "soft" | "rigid"): void;
    selectionChanged?(): void;
  };
  CloudStorage?: TelegramCloudStorage;
};

type TelegramHostWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

function getTelegramWebApp(): TelegramWebApp | null {
  return (window as TelegramHostWindow).Telegram?.WebApp ?? null;
}

function isTelegramMiniApp(): boolean {
  return Boolean(getTelegramWebApp());
}

function getTelegramSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function resolveLaunchSource(searchParams: URLSearchParams): PlatformLaunchContext["source"] {
  if (searchParams.get("startapp") || searchParams.get("tgWebAppStartParam")) {
    return "direct";
  }

  if (searchParams.get("tgWebAppBotInline")) {
    return "inline";
  }

  return "profile";
}

function resolvePlatformProfile(user: TelegramWebAppUser | undefined): SocialProfile | null {
  if (!user) {
    return null;
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.username || "Telegram user";
  return {
    provider: "telegram",
    id: String(user.id),
    displayName,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    languageCode: user.language_code,
    imageUrl: user.photo_url
  };
}

function toTelegramShareUrl(payload: SharePayload): string | null {
  if (payload.telegramShareUrl) {
    return payload.telegramShareUrl;
  }

  if (!payload.linkUrl) {
    return null;
  }

  const shareUrl = new URL("https://t.me/share/url");
  shareUrl.searchParams.set("url", payload.linkUrl);
  if (payload.text) {
    shareUrl.searchParams.set("text", payload.text);
  }
  return shareUrl.toString();
}

function openShareUrl(shareUrl: string, webApp: TelegramWebApp | null): void {
  try {
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(shareUrl);
      return;
    }
  } catch {
    // Continue to fallback methods.
  }

  try {
    if (webApp?.openLink) {
      webApp.openLink(shareUrl, { try_instant_view: false });
      return;
    }
  } catch {
    // Continue to browser fallback.
  }

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

async function withCloudStorage<T>(
  action: (storage: TelegramCloudStorage) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  const cloudStorage = getTelegramWebApp()?.CloudStorage;
  if (!cloudStorage) {
    return fallback();
  }

  try {
    return await action(cloudStorage);
  } catch {
    return fallback();
  }
}

export const telegramPlatform: IPlatform = {
  id: "telegram",
  isOnline: () => navigator.onLine,
  vibrate: (milliseconds) => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback?.impactOccurred) {
      webApp.HapticFeedback.impactOccurred(milliseconds > 40 ? "medium" : "light");
      return;
    }

    navigator.vibrate?.(milliseconds);
  },
  getLaunchContext() {
    const webApp = getTelegramWebApp();
    const searchParams = getTelegramSearchParams();
    return {
      source: resolveLaunchSource(searchParams),
      startParam:
        searchParams.get("startapp") ??
        searchParams.get("tgWebAppStartParam") ??
        webApp?.initDataUnsafe?.start_param ??
        undefined,
      initDataRaw: webApp?.initData,
      platform: webApp?.platform ?? "telegram",
      isNativeShell: true
    };
  },
  getTheme(): PlatformTheme | null {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return null;
    }

    return {
      colorScheme: webApp.colorScheme === "dark" ? "dark" : "light",
      colors: webApp.themeParams
    };
  },
  onThemeChange(listener) {
    const webApp = getTelegramWebApp();
    if (!webApp?.onEvent) {
      return;
    }

    const handler = () => listener(telegramPlatform.getTheme?.() ?? null);
    webApp.onEvent("themeChanged", handler);
    return () => webApp.offEvent?.("themeChanged", handler);
  },
  getViewport(): PlatformViewport | null {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return null;
    }

    return {
      height: webApp.viewportHeight ?? window.innerHeight,
      stableHeight: webApp.viewportStableHeight ?? webApp.viewportHeight ?? window.innerHeight,
      isExpanded: webApp.isExpanded
    };
  },
  onViewportChange(listener) {
    const webApp = getTelegramWebApp();
    if (!webApp?.onEvent) {
      return;
    }

    const handler = () => listener(telegramPlatform.getViewport?.() ?? null);
    webApp.onEvent("viewportChanged", handler);
    return () => webApp.offEvent?.("viewportChanged", handler);
  },
  updateNavigationChrome({ showBack, showSettings }) {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return;
    }

    if (showBack) {
      webApp.BackButton?.show();
    } else {
      webApp.BackButton?.hide();
    }

    if (showSettings) {
      webApp.SettingsButton?.show();
    } else {
      webApp.SettingsButton?.hide();
    }
  },
  setClosingConfirmation(enabled) {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return;
    }

    if (enabled) {
      webApp.enableClosingConfirmation?.();
      return;
    }

    webApp.disableClosingConfirmation?.();
  },
  expand() {
    getTelegramWebApp()?.expand?.();
  },
  requestFullscreen() {
    return getTelegramWebApp()?.requestFullscreen?.();
  },
  installLifecycle(hooks) {
    const webApp = getTelegramWebApp();
    webApp?.ready?.();
    webApp?.expand?.();
    telegramPlatform.updateNavigationChrome?.({ showBack: hooks.canNavigateBack(), showSettings: true });

    const onBack = () => {
      if (hooks.canNavigateBack()) {
        hooks.navigateBack();
        return;
      }

      hooks.navigateHome();
    };
    const onSettings = () => {
      hooks.toggleSettings();
    };
    const onVisibility = () => {
      if (document.hidden) {
        hooks.pauseGame();
        return;
      }

      hooks.resumeGame();
      telegramPlatform.updateNavigationChrome?.({ showBack: hooks.canNavigateBack(), showSettings: true });
    };

    webApp?.BackButton?.onClick?.(onBack);
    webApp?.SettingsButton?.onClick?.(onSettings);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      webApp?.BackButton?.offClick?.(onBack);
      webApp?.SettingsButton?.offClick?.(onSettings);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }
};

export const telegramAds: IAds = {
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

export const telegramAnalytics: IAnalytics = {
  track(event: AnalyticsEvent) {
    console.info("[analytics:telegram]", event.name, event.payload);
  }
};

export const telegramIdentity: IIdentity = {
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
    return resolvePlatformProfile(getTelegramWebApp()?.initDataUnsafe?.user);
  }
};

export const telegramRemoteConfig: IRemoteConfig = {
  async getFeatureFlags() {
    return defaultFeatureFlags;
  },
  async getBalanceConfig() {
    return defaultBalanceConfig;
  }
};

export const telegramShare: IShare = {
  async share(payload: SharePayload) {
    const webApp = getTelegramWebApp();
    if (payload.telegramMessageId && webApp?.shareMessage) {
      await new Promise<void>((resolve) => {
        webApp.shareMessage?.(payload.telegramMessageId!, () => resolve());
      });
      return;
    }

    const shareUrl = toTelegramShareUrl(payload);
    if (shareUrl) {
      openShareUrl(shareUrl, webApp);
      return;
    }

    if (payload.text) {
      const fallbackShareUrl = new URL("https://t.me/share/url");
      fallbackShareUrl.searchParams.set("url", "https://t.me");
      fallbackShareUrl.searchParams.set("text", payload.text);
      openShareUrl(fallbackShareUrl.toString(), webApp);
      return;
    }

    await browserShare.share(payload);
  },
  canShareToStory() {
    return Boolean(getTelegramWebApp()?.shareToStory);
  },
  async shareToStory(payload: SharePayload) {
    const webApp = getTelegramWebApp();
    if (webApp?.shareToStory && payload.storyMediaUrl) {
      const params: Record<string, unknown> = {};
      if (payload.storyText) {
        params.text = payload.storyText;
      }
      if (payload.storyWidgetLinkUrl) {
        params.widget_link = {
          url: payload.storyWidgetLinkUrl,
          name: payload.storyWidgetLinkName ?? "Make yours"
        };
      }

      webApp.shareToStory(payload.storyMediaUrl, params);
      return;
    }

    await telegramShare.share(payload);
  }
};

export const telegramStorage: IStorage = {
  async getItem(key) {
    return withCloudStorage(
      (storage) =>
        new Promise<string | null>((resolve, reject) => {
          storage.getItem(key, (error, value) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(value);
          });
        }),
      () => browserStorage.getItem(key)
    );
  },
  async setItem(key, value) {
    await withCloudStorage(
      (storage) =>
        new Promise<void>((resolve, reject) => {
          storage.setItem(key, value, (error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        }),
      () => browserStorage.setItem(key, value)
    );
  }
};
