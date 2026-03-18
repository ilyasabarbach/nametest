import type Phaser from "phaser";
import { runtime } from "../GameRuntime";

function getActiveSceneKeys(game: Phaser.Game): string[] {
  return game.scene.getScenes(true).map((scene) => scene.scene.key);
}

export async function installPlatformLifecycle(game: Phaser.Game): Promise<void> {
  const activeSceneKeys = new Set<string>();

  const removeListeners = await runtime.platform.installLifecycle?.({
    pauseGame() {
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
    navigateHome() {
      activeSceneKeys.clear();
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
      removeListeners();
    },
    { once: true }
  );
}
