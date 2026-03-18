import Phaser from "phaser";
import { runtime } from "../GameRuntime";
import { clearHud } from "../ui/components/hud";
import { pulse } from "../ui/transitions/pulse";
import { playToneSequence } from "../ui/transitions/playTone";

type RevealStep = {
  title: string;
  detail: string;
  duration: number;
};

export class TestScene extends Phaser.Scene {
  private revealComplete = false;

  constructor() {
    super("TestScene");
  }

  create(): void {
    clearHud();
    const width = this.scale.width;
    const height = this.scale.height;
    const selectedTest = runtime.session.selectedTest;
    const cardGradient = selectedTest.art.cardGradient;
    const accent = Phaser.Display.Color.HexStringToColor(selectedTest.resultBands[0]?.accent ?? "#ffd166").color;
    const revealSteps = this.buildRevealSteps();
    const orbY = Math.max(180, height * 0.26);

    this.cameras.main.setBackgroundColor(cardGradient[0]);
    this.add.rectangle(width / 2, height / 2, width, height, Phaser.Display.Color.HexStringToColor(cardGradient[0]).color);
    this.add.circle(width / 2, orbY, Math.min(132, width * 0.26), accent, 0.09);
    this.add.circle(width / 2, orbY, Math.min(94, width * 0.2), accent, 0.16);
    this.add.circle(width / 2, orbY, Math.min(54, width * 0.11), 0xffffff, 0.22);

    const symbol = this.add.text(width / 2, orbY - 4, this.getSymbolGlyph(selectedTest.art.symbol), {
      fontFamily: "Georgia",
      fontSize: `${Math.max(34, Math.min(64, width * 0.08))}px`,
      color: "#f8f4e8"
    }).setOrigin(0.5);
    pulse(symbol);

    const testTitle = this.add.text(width / 2, Math.max(54, height * 0.1), runtime.copy[selectedTest.titleKey], {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#ffd166",
      align: "center"
    }).setOrigin(0.5);
    testTitle.setAlpha(0.92);

    const reading = this.add.text(width / 2, height / 2 + 30, revealSteps[0]?.title ?? "Reading the stars...", {
      fontFamily: "Georgia",
      fontSize: `${Math.max(28, Math.min(40, width * 0.05))}px`,
      color: "#f8f4e8",
      align: "center",
      wordWrap: { width: Math.min(width - 48, 520) }
    }).setOrigin(0.5);

    const detail = this.add.text(width / 2, height / 2 + 94, revealSteps[0]?.detail ?? "", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#dfe8ff",
      align: "center",
      wordWrap: { width: Math.min(width - 64, 560) },
      lineSpacing: 8
    }).setOrigin(0.5);

    const progressBoxWidth = Math.min(320, width - 72);
    const progressBoxY = Math.min(height - 116, height * 0.74);
    const progressTrack = this.add.rectangle(width / 2, progressBoxY, progressBoxWidth, 12, 0xffffff, 0.12).setOrigin(0.5);
    progressTrack.setStrokeStyle(1, 0xffffff, 0.16);
    const progressFill = this.add.rectangle(
      width / 2 - progressBoxWidth / 2,
      progressBoxY,
      0,
      12,
      accent,
      0.95
    ).setOrigin(0, 0.5);

    const progressLabel = this.add.text(width / 2, progressBoxY + 28, "", {
      fontFamily: "Georgia",
      fontSize: "14px",
      color: "#b7c8ef"
    }).setOrigin(0.5);

    const skipHint = this.add.text(width / 2, height - 44, "Tap to skip reveal", {
      fontFamily: "Georgia",
      fontSize: "14px",
      color: "#f8f4e8"
    }).setOrigin(0.5);
    skipHint.setAlpha(0.72);

    pulse(reading);
    playToneSequence([392, 440, 523, 659], 180);

    const finishReveal = () => {
      if (this.revealComplete) {
        return;
      }

      this.revealComplete = true;
      runtime.completeSession();
      runtime.analytics.track({
        name: "test_completed",
        payload: {
          testId: runtime.session.selectedTest.id,
          score: runtime.session.latestResult!.score,
          resultKey: runtime.session.latestResult!.resultKey
        }
      });
      this.scene.start("ResultScene");
    };

    const runStep = (index: number) => {
      if (this.revealComplete) {
        return;
      }

      const step = revealSteps[index];
      if (!step) {
        finishReveal();
        return;
      }

      reading.setText(step.title);
      detail.setText(step.detail);
      progressLabel.setText(`Step ${index + 1} of ${revealSteps.length}`);
      reading.setAlpha(0.18);
      detail.setAlpha(0.18);
      reading.y = height / 2 + 42;
      detail.y = height / 2 + 106;

      this.tweens.add({
        targets: [reading, detail],
        alpha: 1,
        y: "-=12",
        duration: 220,
        ease: "Sine.easeOut"
      });

      this.tweens.add({
        targets: progressFill,
        width: progressBoxWidth * ((index + 1) / revealSteps.length),
        duration: step.duration - 80,
        ease: "Sine.easeInOut"
      });

      this.time.delayedCall(step.duration, () => runStep(index + 1));
    };

    this.input.once("pointerdown", () => {
      skipHint.setText("Reveal skipped");
      finishReveal();
    });

    runStep(0);
  }

  private buildRevealSteps(): RevealStep[] {
    const { selectedTest, names } = runtime.session;
    const testTitle = runtime.copy[selectedTest.titleKey] ?? selectedTest.id;
    const categoryLabel = this.getCategoryLabel(selectedTest.category);
    const symbolLabel = this.getSymbolLabel(selectedTest.art.symbol);

    return [
      {
        title: `Opening the ${testTitle}`,
        detail: `${names.primaryName} and ${names.partnerName} just entered the ${categoryLabel} chamber.`,
        duration: 700
      },
      {
        title: `Tracing the ${symbolLabel}`,
        detail: `Lining up hidden patterns between ${names.primaryName} and ${names.partnerName}.`,
        duration: 850
      },
      {
        title: "Reading the energy",
        detail: `Weighing the chemistry, chaos, and lucky timing behind this match.`,
        duration: 850
      },
      {
        title: "Locking your result",
        detail: "Finalizing the score and preparing your headline reveal.",
        duration: 650
      }
    ];
  }

  private getCategoryLabel(category: string): string {
    switch (category) {
      case "compatibility":
        return "compatibility";
      case "personality":
        return "personality";
      case "future":
        return "future-reading";
      default:
        return "mystery";
    }
  }

  private getSymbolGlyph(symbol: string): string {
    switch (symbol) {
      case "comet":
        return "COMET";
      case "badge":
        return "BADGE";
      case "storm":
        return "STORM";
      default:
        return "STAR";
    }
  }

  private getSymbolLabel(symbol: string): string {
    switch (symbol) {
      case "comet":
        return "comet trail";
      case "badge":
        return "spotlight badge";
      case "storm":
        return "storm signal";
      default:
        return "star map";
    }
  }
}
