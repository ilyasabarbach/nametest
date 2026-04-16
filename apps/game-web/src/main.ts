import "./styles/main.css";
import { createGame } from "./boot/createGame";
import { runtime } from "./GameRuntime";
import { installPlatformLifecycle } from "./platform/installLifecycle";
import { getThemePreference, type ThemePreference } from "./ui/themePreference";

function applyPlatformEnvironment(): void {
  const telegramWebApp = (window as any).Telegram?.WebApp;
  // Ensure we tell Telegram we are ready as early as possible so UI does not hang or fallback.
  telegramWebApp?.ready?.();

  // Globally attach light haptic feedback to all button clicks
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button") || target?.closest("[data-action]")) {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    }
  });

  const root = document.documentElement;
  let currentThemePreference: ThemePreference = getThemePreference();
  const telegramThemeMap: Record<string, string> = {
    bg_color: "--tg-theme-bg-color",
    secondary_bg_color: "--tg-theme-secondary-bg-color",
    text_color: "--tg-theme-text-color",
    hint_color: "--tg-theme-hint-color",
    link_color: "--tg-theme-link-color",
    button_color: "--tg-theme-button-color",
    button_text_color: "--tg-theme-button-text-color",
    header_bg_color: "--tg-theme-header-bg-color",
    accent_text_color: "--tg-theme-accent-text-color",
    section_bg_color: "--tg-theme-section-bg-color",
    section_header_text_color: "--tg-theme-section-header-text-color",
    subtitle_text_color: "--tg-theme-subtitle-text-color",
    destructive_text_color: "--tg-theme-destructive-text-color"
  };
  const getCssVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
  const clearTelegramThemeVars = () => {
    for (const [key, mappedVar] of Object.entries(telegramThemeMap)) {
      root.style.removeProperty(`--telegram-${key}`);
      root.style.removeProperty(mappedVar);
    }
  };

  const syncTheme = () => {
    const theme = runtime.platform.getTheme?.();
    const platformScheme = theme?.colorScheme === "dark" ? "dark" : "light";
    const effectiveScheme = currentThemePreference === "auto" ? platformScheme : currentThemePreference;
    root.dataset.themePreference = currentThemePreference;
    root.dataset.platformTheme = effectiveScheme;

    if (currentThemePreference === "auto") {
      for (const [key, value] of Object.entries(theme?.colors ?? {})) {
        root.style.setProperty(`--telegram-${key}`, value);
        const mappedVar = telegramThemeMap[key];
        if (mappedVar) {
          root.style.setProperty(mappedVar, value);
        }
      }
    } else {
      clearTelegramThemeVars();
    }

    const bgColor = getCssVar("--tg-theme-bg-color");
    const headerColor = getCssVar("--tg-theme-header-bg-color") || bgColor;
    if (bgColor) {
      telegramWebApp?.setBackgroundColor?.(bgColor);
    }
    if (headerColor) {
      telegramWebApp?.setHeaderColor?.(headerColor);
    }
  };

  const syncViewport = () => {
    const viewport = runtime.platform.getViewport?.();
    root.style.setProperty("--platform-viewport-height", `${viewport?.stableHeight ?? window.innerHeight}px`);
  };

  runtime.platform.expand?.();
  telegramWebApp?.expand?.();
  void runtime.platform.requestFullscreen?.();
  syncTheme();
  syncViewport();
  runtime.platform.onThemeChange?.(() => syncTheme());
  runtime.platform.onViewportChange?.(() => syncViewport());
  window.addEventListener("app:theme-preference", (event) => {
    const preference = (event as CustomEvent<{ preference?: ThemePreference }>).detail?.preference;
    if (!preference) {
      return;
    }
    currentThemePreference = preference;
    syncTheme();
  });
  window.addEventListener("resize", syncViewport);
}

applyPlatformEnvironment();
const game = createGame();
void installPlatformLifecycle(game);
