import Phaser from "phaser";
import { runtime } from "../GameRuntime";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  async create(): Promise<void> {
    const width = this.scale.width;
    const height = this.scale.height;
    let visualProgress = 0.08;
    let runtimeReady = false;

    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf5);
    this.add.text(width / 2, Math.max(74, height * 0.12), runtime.copy["preload.title"], {
      fontFamily: "Outfit",
      fontSize: "28px",
      color: "#18213a"
    }).setOrigin(0.5);

    this.add.text(width / 2, Math.max(112, height * 0.18), runtime.copy["preload.body"], {
      fontFamily: "Outfit",
      fontSize: "16px",
      color: "#5f677f",
      wordWrap: { width: Math.min(width - 56, 560) },
      align: "center"
    }).setOrigin(0.5);

    const trackWidth = Math.min(420, width - 72);
    const trackY = height - 110;
    this.add.rectangle(width / 2, trackY, trackWidth, 12, 0xeadfce, 0.92).setOrigin(0.5);
    const progressFill = this.add.rectangle(width / 2 - trackWidth / 2, trackY, trackWidth * visualProgress, 12, 0xd86135, 0.96).setOrigin(0, 0.5);
    const progressLabel = this.add.text(width / 2, trackY + 28, runtime.copy["preload.progress"].replace("{percent}", "8"), {
      fontFamily: "Outfit",
      fontSize: "14px",
      color: "#7a5b45"
    }).setOrigin(0.5);

    const teaserCards = [
      { x: width * 0.28, y: height * 0.42, title: runtime.copy["preload.card1"], color: 0xff7a59 },
      { x: width * 0.5, y: height * 0.5, title: runtime.copy["preload.card2"], color: 0xffd166 },
      { x: width * 0.72, y: height * 0.42, title: runtime.copy["preload.card3"], color: 0x57cc99 }
    ];

    teaserCards.forEach((card, index) => {
      const box = this.add.rectangle(card.x, card.y, Math.min(210, width * 0.26), Math.min(150, height * 0.17), card.color, 0.18);
      box.setStrokeStyle(1, card.color, 0.32);
      this.add.text(card.x, card.y, card.title, {
        fontFamily: "Outfit",
        fontSize: "18px",
        color: "#f8f4e8",
        align: "center",
        wordWrap: { width: Math.min(180, width * 0.22) }
      }).setOrigin(0.5);
      this.tweens.add({
        targets: box,
        y: box.y - 10,
        duration: 1200 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    });

    const visualTimer = this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => {
        const target = runtimeReady ? 1 : 0.92;
        visualProgress = Math.min(target, visualProgress + (runtimeReady ? 0.12 : 0.04));
        progressFill.width = trackWidth * visualProgress;
        progressLabel.setText(runtime.copy["preload.progress"].replace("{percent}", String(Math.round(visualProgress * 100))));

        if (runtimeReady && visualProgress >= 1) {
          visualTimer.remove();
          this.scene.start(runtime.getRestoreSceneKey());
        }
      }
    });

    await runtime.init();
    runtimeReady = true;
    if (visualProgress >= 1) {
      visualTimer.remove();
      this.scene.start(runtime.getRestoreSceneKey());
      return;
    }

  }
}
