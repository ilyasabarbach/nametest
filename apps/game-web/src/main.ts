import "./styles/main.css";
import { createGame } from "./boot/createGame";
import { runtime } from "./GameRuntime";
import { installPlatformLifecycle } from "./platform/installLifecycle";

function applyPlatformEnvironment(): void {
  // Ensure we tell Telegram we are ready as early as possible so UI does not hang or fallback.
  if ((window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.ready?.();
  }

  const root = document.documentElement;

  const syncTheme = () => {
    const theme = runtime.platform.getTheme?.();
    root.dataset.platformTheme = theme?.colorScheme ?? "light";
    Object.entries(theme?.colors ?? {}).forEach(([key, value]) => {
      root.style.setProperty(`--telegram-${key}`, value);
    });
  };

  const syncViewport = () => {
    const viewport = runtime.platform.getViewport?.();
    root.style.setProperty("--platform-viewport-height", `${viewport?.stableHeight ?? window.innerHeight}px`);
  };

  runtime.platform.expand?.();
  void runtime.platform.requestFullscreen?.();
  syncTheme();
  syncViewport();
  runtime.platform.onThemeChange?.(() => syncTheme());
  runtime.platform.onViewportChange?.(() => syncViewport());
  window.addEventListener("resize", syncViewport);
}

applyPlatformEnvironment();
const game = createGame();
void installPlatformLifecycle(game);
