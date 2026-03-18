import Phaser from "phaser";
import { clearHud } from "../ui/components/hud";
import { runtime } from "../GameRuntime";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    clearHud();
    runtime.analytics.track({ name: "app_open", payload: { source: "boot" } });
    this.scene.start("PreloadScene");
  }
}
