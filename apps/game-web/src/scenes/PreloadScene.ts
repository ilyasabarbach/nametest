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

    // Dark background #0c1324
    this.add.rectangle(width / 2, height / 2, width, height, 0x0c1324);
    
    // Ambient primary glow (purple) top left
    this.add.circle(0, 0, width * 0.8, 0x9333ea, 0.15);
    // Ambient secondary glow (pink) bottom right
    this.add.circle(width, height, width * 0.8, 0xbe0062, 0.15);

    this.add.text(width / 2, Math.max(74, height * 0.22), runtime.copy["preload.title"], {
      fontFamily: "Manrope",
      fontSize: "32px",
      fontStyle: "800",
      color: "#ddb8ff" // text-primary
    }).setOrigin(0.5);

    this.add.text(width / 2, Math.max(112, height * 0.28), runtime.copy["preload.body"], {
      fontFamily: "Manrope",
      fontSize: "16px",
      color: "#988ca0", // text-outline
      wordWrap: { width: Math.min(width - 56, 560) },
      align: "center"
    }).setOrigin(0.5);

    const trackWidth = Math.min(320, width - 72);
    const trackY = height - 110;
    
    // Background track (surface-variant)
    this.add.rectangle(width / 2, trackY, trackWidth, 6, 0x2e3447, 1).setOrigin(0.5);
    
    // Progress fill gradient effect (solid primary)
    const progressFill = this.add.rectangle(width / 2 - trackWidth / 2, trackY, trackWidth * visualProgress, 6, 0xddb8ff, 1).setOrigin(0, 0.5);
    
    const progressLabel = this.add.text(width / 2, trackY + 28, runtime.copy["preload.progress"].replace("{percent}", "8"), {
      fontFamily: "Manrope",
      fontSize: "12px",
      fontStyle: "700",
      color: "#988ca0"
    }).setOrigin(0.5);

    const teaserCards = [
      { x: width * 0.2, y: height * 0.5, title: runtime.copy["preload.card1"], color: 0x9333ea },
      { x: width * 0.5, y: height * 0.58, title: runtime.copy["preload.card2"], color: 0xbe0062 },
      { x: width * 0.8, y: height * 0.5, title: runtime.copy["preload.card3"], color: 0xddb8ff }
    ];

    teaserCards.forEach((card, index) => {
      // surface-container-highest
      const box = this.add.rectangle(card.x, card.y, Math.min(180, width * 0.26), Math.min(120, height * 0.17), 0x2e3447, 0.8);
      box.setStrokeStyle(1, card.color, 0.4);
      
      this.add.text(card.x, card.y, card.title, {
        fontFamily: "Manrope",
        fontSize: "14px",
        fontStyle: "600",
        color: "#dce1fb", // text-on-surface
        align: "center",
        wordWrap: { width: Math.min(140, width * 0.22) }
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: box,
        y: box.y - 12,
        duration: 1500 + index * 200,
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
