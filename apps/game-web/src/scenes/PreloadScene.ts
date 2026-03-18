import Phaser from "phaser";
import { runtime } from "../GameRuntime";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  async create(): Promise<void> {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1630);
    this.add.text(width / 2, height / 2 - 32, "Loading the cosmos...", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#f8f4e8"
    }).setOrigin(0.5);

    await runtime.init();
    this.scene.start("HomeScene");
  }
}
