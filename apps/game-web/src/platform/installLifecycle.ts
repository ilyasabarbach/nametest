import type Phaser from "phaser";
import { runtime } from "../GameRuntime";

function getActiveSceneKeys(game: Phaser.Game): string[] {
  return game.scene.getScenes(true).map((scene) => scene.scene.key);
}

export async function installPlatformLifecycle(game: Phaser.Game): Promise<void> {
  const activeSceneKeys = new Set<string>();
  const syncNavigationChrome = () => {
    runtime.platform.updateNavigationChrome?.({
      showBack: runtime.canNavigateBackScene(),
      showSettings: true
    });
  };

  const removeListeners = await runtime.platform.installLifecycle?.({
    pauseGame() {
      void runtime.persistProgress();
      void runtime.persistAppState();
      runtime.platform.setClosingConfirmation?.(runtime.canNavigateBackScene());
      activeSceneKeys.clear();
      getActiveSceneKeys(game).forEach((key) => {
        activeSceneKeys.add(key);
        game.scene.pause(key);
      });
    },
    resumeGame() {
      if (activeSceneKeys.size === 0) {
        return;
      }

      activeSceneKeys.forEach((key) => {
        game.scene.resume(key);
      });
      activeSceneKeys.clear();
      syncNavigationChrome();
    },
    navigateBack() {
      activeSceneKeys.clear();
      const previousSceneKey = runtime.popBackScene();
      if (!previousSceneKey) {
        runtime.resetSceneHistory("HomeScene");
        game.scene.start("HomeScene");
        syncNavigationChrome();
        return;
      }

      game.scene.start(previousSceneKey);
      syncNavigationChrome();
    },
    canNavigateBack() {
      return runtime.canNavigateBackScene();
    },
    navigateHome() {
      activeSceneKeys.clear();
      runtime.resetSceneHistory("HomeScene");
      game.scene.start("HomeScene");
      syncNavigationChrome();
    },
    canExitApp() {
      return game.scene.isActive("HomeScene");
    },
    toggleSettings() {
      window.dispatchEvent(new CustomEvent("platform:settings-toggle"));
    }
  });

  syncNavigationChrome();
  runtime.platform.setClosingConfirmation?.(runtime.canNavigateBackScene());

  if (!removeListeners) {
    return;
  }

  window.addEventListener(
    "beforeunload",
    () => {
      void runtime.persistProgress();
      void runtime.persistAppState();
      removeListeners();
    },
    { once: true }
  );
}
