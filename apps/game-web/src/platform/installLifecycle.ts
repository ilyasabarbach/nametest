import type Phaser from "phaser";
import { runtime } from "../GameRuntime";

function getActiveSceneKeys(game: Phaser.Game): string[] {
  return game.scene.getScenes(true).map((scene) => scene.scene.key);
}

export async function installPlatformLifecycle(game: Phaser.Game): Promise<void> {
  const activeSceneKeys = new Set<string>();

  const removeListeners = await runtime.platform.installLifecycle?.({
    pauseGame() {
      void runtime.persistProgress();
      void runtime.persistAppState();
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
    },
    navigateBack() {
      activeSceneKeys.clear();
      const previousSceneKey = runtime.popBackScene();
      if (!previousSceneKey) {
        runtime.resetSceneHistory("HomeScene");
        game.scene.start("HomeScene");
        return;
      }

      game.scene.start(previousSceneKey);
    },
    canNavigateBack() {
      return runtime.canNavigateBackScene();
    },
    navigateHome() {
      activeSceneKeys.clear();
      runtime.resetSceneHistory("HomeScene");
      game.scene.start("HomeScene");
    },
    canExitApp() {
      return game.scene.isActive("HomeScene");
    }
  });

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
