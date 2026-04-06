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
  const merged = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  hashParams.forEach((value, key) => {
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  });
  return merged;
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

function toTelegramNativeShareUrl(payload: SharePayload): string | null {
  const targetUrl = payload.linkUrl;
  if (!targetUrl) {
    return null;
  }

  const nativeUrl = new URL("tg://msg_url");
  nativeUrl.searchParams.set("url", targetUrl);
  if (payload.text) {
    nativeUrl.searchParams.set("text", payload.text);
  }
  return nativeUrl.toString();
}

function showTelegramShareFallback(shareUrl: string, shareText?: string): void {
  const existing = document.querySelector<HTMLElement>("[data-telegram-share-fallback]");
  existing?.remove();

  const backdrop = document.createElement("div");
  backdrop.setAttribute("data-telegram-share-fallback", "true");
  backdrop.style.position = "fixed";
  backdrop.style.inset = "0";
  backdrop.style.zIndex = "99999";
  backdrop.style.background = "rgba(12, 16, 28, 0.78)";
  backdrop.style.display = "flex";
  backdrop.style.alignItems = "center";
  backdrop.style.justifyContent = "center";
  backdrop.style.padding = "20px";

  const card = document.createElement("div");
  card.style.width = "min(420px, 100%)";
  card.style.background = "#fff8ee";
  card.style.borderRadius = "20px";
  card.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.22)";
  card.style.padding = "20px";
  card.style.display = "grid";
  card.style.gap = "12px";
  card.style.fontFamily = "Georgia, serif";
  card.style.color = "#23160f";

  const title = document.createElement("strong");
  title.textContent = "Telegram share needs a manual nudge";
  title.style.fontSize = "20px";

  const body = document.createElement("p");
  body.textContent = "The automatic share handoff did not open. You can still open the Telegram share screen directly.";
  body.style.margin = "0";
  body.style.lineHeight = "1.45";

  const linkBox = document.createElement("textarea");
  linkBox.value = shareUrl;
  linkBox.readOnly = true;
  linkBox.style.width = "100%";
  linkBox.style.minHeight = "90px";
  linkBox.style.borderRadius = "12px";
  linkBox.style.border = "1px solid #e4cfbf";
  linkBox.style.padding = "10px 12px";
  linkBox.style.fontFamily = "Consolas, monospace";
  linkBox.style.fontSize = "12px";
  linkBox.style.background = "#fffdf8";
  linkBox.style.color = "#4c2f1f";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.flexWrap = "wrap";
  actions.style.gap = "10px";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "Open Telegram share";
  openButton.style.flex = "1 1 180px";
  openButton.style.border = "0";
  openButton.style.borderRadius = "14px";
  openButton.style.padding = "12px 16px";
  openButton.style.background = "#f36d32";
  openButton.style.color = "#fff";
  openButton.style.fontWeight = "700";
  openButton.style.cursor = "pointer";
  openButton.addEventListener("click", () => {
    window.location.href = shareUrl;
  });

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.textContent = "Copy share link";
  copyButton.style.flex = "1 1 140px";
  copyButton.style.border = "1px solid #d9beaa";
  copyButton.style.borderRadius = "14px";
  copyButton.style.padding = "12px 16px";
  copyButton.style.background = "#fff";
  copyButton.style.color = "#5b3826";
  copyButton.style.fontWeight = "700";
  copyButton.style.cursor = "pointer";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyButton.textContent = "Link copied";
    } catch {
      linkBox.focus();
      linkBox.select();
      copyButton.textContent = "Select and copy";
    }
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.style.border = "0";
  closeButton.style.background = "transparent";
  closeButton.style.color = "#7a5540";
  closeButton.style.fontWeight = "700";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    backdrop.remove();
  });

  if (shareText) {
    const sharePreview = document.createElement("p");
    sharePreview.textContent = shareText;
    sharePreview.style.margin = "0";
    sharePreview.style.fontSize = "13px";
    sharePreview.style.lineHeight = "1.45";
    sharePreview.style.color = "#7a5540";
    card.append(title, body, sharePreview, linkBox, actions, closeButton);
  } else {
    card.append(title, body, linkBox, actions, closeButton);
  }

  actions.append(openButton, copyButton);
  backdrop.append(card);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      backdrop.remove();
    }
  });

  document.body.append(backdrop);
}

function showTelegramShareAssist(shareUrl: string, shareText?: string): { close(): void; markManual(): void } {
  const existing = document.querySelector<HTMLElement>("[data-telegram-share-fallback]");
  existing?.remove();

  const backdrop = document.createElement("div");
  backdrop.setAttribute("data-telegram-share-fallback", "true");
  backdrop.style.position = "fixed";
  backdrop.style.inset = "0";
  backdrop.style.zIndex = "99999";
  backdrop.style.background = "rgba(12, 16, 28, 0.52)";
  backdrop.style.display = "flex";
  backdrop.style.alignItems = "flex-end";
  backdrop.style.justifyContent = "center";
  backdrop.style.padding = "16px";

  const sheet = document.createElement("div");
  sheet.style.width = "min(460px, 100%)";
  sheet.style.background = "#fff8ee";
  sheet.style.borderRadius = "22px 22px 16px 16px";
  sheet.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.24)";
  sheet.style.padding = "18px";
  sheet.style.display = "grid";
  sheet.style.gap = "10px";
  sheet.style.fontFamily = "Georgia, serif";
  sheet.style.color = "#23160f";

  const title = document.createElement("strong");
  title.textContent = "Opening Telegram share";
  title.style.fontSize = "20px";

  const body = document.createElement("p");
  body.textContent = "If Telegram does not open right away, use the button below.";
  body.style.margin = "0";
  body.style.lineHeight = "1.45";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.flexWrap = "wrap";
  actions.style.gap = "10px";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "Open share";
  openButton.style.flex = "1 1 180px";
  openButton.style.border = "0";
  openButton.style.borderRadius = "14px";
  openButton.style.padding = "12px 16px";
  openButton.style.background = "#f36d32";
  openButton.style.color = "#fff";
  openButton.style.fontWeight = "700";
  openButton.style.cursor = "pointer";
  openButton.addEventListener("click", () => {
    window.location.href = shareUrl;
  });

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.textContent = "Copy link";
  copyButton.style.flex = "1 1 140px";
  copyButton.style.border = "1px solid #d9beaa";
  copyButton.style.borderRadius = "14px";
  copyButton.style.padding = "12px 16px";
  copyButton.style.background = "#fff";
  copyButton.style.color = "#5b3826";
  copyButton.style.fontWeight = "700";
  copyButton.style.cursor = "pointer";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyButton.textContent = "Link copied";
    } catch {
      copyButton.textContent = "Copy failed";
    }
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.style.border = "0";
  closeButton.style.background = "transparent";
  closeButton.style.color = "#7a5540";
  closeButton.style.fontWeight = "700";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    backdrop.remove();
  });

  if (shareText) {
    const sharePreview = document.createElement("p");
    sharePreview.textContent = shareText;
    sharePreview.style.margin = "0";
    sharePreview.style.fontSize = "13px";
    sharePreview.style.lineHeight = "1.45";
    sharePreview.style.color = "#7a5540";
    sheet.append(title, body, sharePreview, actions, closeButton);
  } else {
    sheet.append(title, body, actions, closeButton);
  }

  actions.append(openButton, copyButton);
  backdrop.append(sheet);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      backdrop.remove();
    }
  });
  document.body.append(backdrop);

  return {
    close() {
      backdrop.remove();
    },
    markManual() {
      title.textContent = "Telegram share needs a manual tap";
      body.textContent = "Telegram did not switch to the share screen automatically. Use Open share or copy the link.";
      openButton.textContent = "Open Telegram share";
    }
  };
}

function openShareUrl(
  shareUrl: string,
  webApp: TelegramWebApp | null,
  shareText?: string,
  webFallbackUrl?: string
): void {
  const assist = showTelegramShareAssist(webFallbackUrl ?? shareUrl, shareText);
  let handoffObserved = false;
  let bridgeAttempted = false;
  const markHandoff = () => {
    handoffObserved = true;
    assist.close();
  };
  document.addEventListener("visibilitychange", markHandoff, { once: true });
  window.addEventListener("pagehide", markHandoff, { once: true });

  const showManualFallback = () => {
    window.setTimeout(() => {
      if (handoffObserved) {
        return;
      }

      if (webFallbackUrl && webFallbackUrl !== shareUrl) {
        try {
          webApp?.openTelegramLink?.(webFallbackUrl);
        } catch {
          // keep manual fallback below
        }
      }

      assist.markManual();
      showTelegramShareFallback(webFallbackUrl ?? shareUrl, shareText);
    }, bridgeAttempted ? 900 : 500);
  };

  try {
    if (webApp?.openTelegramLink) {
      bridgeAttempted = true;
      webApp.openTelegramLink(shareUrl);
      showManualFallback();
      return;
    }
  } catch {
    // Continue to fallback methods.
  }

  try {
    if (webApp?.openLink) {
      bridgeAttempted = true;
      webApp.openLink(shareUrl, { try_instant_view: false });
      showManualFallback();
      return;
    }
  } catch {
    // Continue to browser fallback.
  }

  const popup = window.open(shareUrl, "_blank", "noopener,noreferrer");
  if (!popup) {
    const finalUrl = webFallbackUrl ?? shareUrl;
    try {
      window.location.assign(finalUrl);
    } catch {
      window.location.href = finalUrl;
    }
    showManualFallback();
  }
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
      const platform = webApp?.platform ?? "";
      const useNativePhoneShare = platform === "android" || platform === "ios";
      if (useNativePhoneShare) {
        const nativeUrl = toTelegramNativeShareUrl(payload);
        if (nativeUrl) {
          openShareUrl(nativeUrl, webApp, payload.text, shareUrl);
          return;
        }
      }

      openShareUrl(shareUrl, webApp, payload.text);
      return;
    }

    if (payload.text) {
      const fallbackShareUrl = new URL("https://t.me/share/url");
      fallbackShareUrl.searchParams.set("url", "https://t.me");
      fallbackShareUrl.searchParams.set("text", payload.text);
      openShareUrl(fallbackShareUrl.toString(), webApp, payload.text);
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
