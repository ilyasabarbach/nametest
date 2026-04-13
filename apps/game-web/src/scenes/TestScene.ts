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
    runtime.recordSceneVisit("TestScene");
    this.revealComplete = false;
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
      fontFamily: "Manrope",
      fontSize: `${Math.max(34, Math.min(64, width * 0.08))}px`,
      color: "#f8f4e8"
    }).setOrigin(0.5);
    pulse(symbol);

    const testTitle = this.add.text(width / 2, Math.max(54, height * 0.1), runtime.copy[selectedTest.titleKey], {
      fontFamily: "Manrope",
      fontSize: "18px",
      color: "#ffd166",
      align: "center"
    }).setOrigin(0.5);
    testTitle.setAlpha(0.92);

    const reading = this.add.text(width / 2, height / 2 + 30, revealSteps[0]?.title ?? runtime.copy["test.readingDefault"], {
      fontFamily: "Manrope",
      fontSize: `${Math.max(28, Math.min(40, width * 0.05))}px`,
      color: "#f8f4e8",
      align: "center",
      wordWrap: { width: Math.min(width - 48, 520) }
    }).setOrigin(0.5);

    const detail = this.add.text(width / 2, height / 2 + 94, revealSteps[0]?.detail ?? "", {
      fontFamily: "Manrope",
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
      fontFamily: "Manrope",
      fontSize: "14px",
      color: "#b7c8ef"
    }).setOrigin(0.5);

    const skipHint = this.add.text(width / 2, height - 44, runtime.copy["test.skipHint"], {
      fontFamily: "Manrope",
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
      progressLabel.setText(
        runtime.copy["test.stepLabel"].replace("{current}", String(index + 1)).replace("{total}", String(revealSteps.length))
      );
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
      skipHint.setText(runtime.copy["test.skipped"]);
      finishReveal();
    });

    runStep(0);
  }

  private buildRevealSteps(): RevealStep[] {
    const { selectedTest, names } = runtime.session;
    const testTitle = runtime.copy[selectedTest.titleKey] ?? selectedTest.id;
    const categoryLabel = this.getCategoryLabel(selectedTest.category);
    const symbolLabel = this.getSymbolLabel(selectedTest.art.symbol);
    const hasPrimaryPrompt = selectedTest.prompts.some((prompt) => prompt.type === "name" && prompt.id === "primaryName");
    const hasPartnerPrompt = selectedTest.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName");

    return [
      {
        title: runtime.copy["test.step.opening"].replace("{test}", testTitle),
        detail: (
          hasPartnerPrompt
            ? runtime.copy["test.step.openingDetail"]
            : hasPrimaryPrompt
              ? runtime.copy["test.step.openingDetailSolo"]
              : runtime.copy["test.step.openingDetailTouch"]
        )
          .replace("{left}", names.primaryName)
          .replace("{right}", names.partnerName)
          .replace("{category}", categoryLabel),
        duration: 700
      },
      {
        title: runtime.copy["test.step.tracing"].replace("{symbol}", symbolLabel),
        detail: (
          hasPartnerPrompt
            ? runtime.copy["test.step.tracingDetail"]
            : hasPrimaryPrompt
              ? runtime.copy["test.step.tracingDetailSolo"]
              : runtime.copy["test.step.tracingDetailTouch"]
        )
          .replace("{left}", names.primaryName)
          .replace("{right}", names.partnerName),
        duration: 850
      },
      {
        title: runtime.copy["test.step.energy"],
        detail: runtime.copy[hasPartnerPrompt ? "test.step.energyDetail" : "test.step.energyDetailSolo"],
        duration: 850
      },
      {
        title: runtime.copy["test.step.locking"],
        detail: runtime.copy["test.step.lockingDetail"],
        duration: 650
      }
    ];
  }

  private getCategoryLabel(category: string): string {
    switch (category) {
      case "compatibility":
        return runtime.copy["test.category.compatibility"];
      case "personality":
        return runtime.copy["test.category.personality"];
      case "future":
        return runtime.copy["test.category.future"];
      default:
        return runtime.copy["test.category.default"];
    }
  }

  private getSymbolGlyph(symbol: string): string {
    switch (symbol) {
      case "comet":
        return runtime.copy["test.symbol.cometGlyph"];
      case "badge":
        return runtime.copy["test.symbol.badgeGlyph"];
      case "storm":
        return runtime.copy["test.symbol.stormGlyph"];
      default:
        return runtime.copy["test.symbol.defaultGlyph"];
    }
  }

  private getSymbolLabel(symbol: string): string {
    switch (symbol) {
      case "comet":
        return runtime.copy["test.symbol.cometLabel"];
      case "badge":
        return runtime.copy["test.symbol.badgeLabel"];
      case "storm":
        return runtime.copy["test.symbol.stormLabel"];
      default:
        return runtime.copy["test.symbol.defaultLabel"];
    }
  }
}
