import Phaser from "phaser";
import { runtime } from "../GameRuntime";
import { createReplayState, sanitizeName } from "@nametests/core";
import { showResultOverlay } from "../ui/overlays/resultOverlay";
import { buildShareCard } from "../ui/components/shareCard";
import { playToneSequence } from "../ui/transitions/playTone";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const card = runtime.latestCard();
    const progressionSummary = runtime.session.progressSummary;
    const unlockCelebrated = Boolean(progressionSummary?.newlyUnlockedTestIds?.length);
    const progressionItems = [
      ...(progressionSummary?.newlyCollectedResultKey
        ? [
            {
              title: runtime.copy["result.progressCollected"],
              detail: card.headline
            }
          ]
        : []),
      ...(progressionSummary?.newlyUnlockedTestIds ?? []).map((testId) => {
        const unlockedTest = runtime.state.allTests.find((test) => test.id === testId);
        return {
          title: runtime.copy["result.progressUnlocked"],
          detail: unlockedTest ? runtime.copy[unlockedTest.titleKey] : testId
        };
      })
    ];
    this.add.rectangle(width / 2, height / 2, width, height, 0x101528);
    this.add.circle(width - 110, 164, Math.min(72, width * 0.16), Phaser.Display.Color.HexStringToColor(card.accent).color, 0.16);
    this.createParticles(card.accent);
    playToneSequence([440, 554, 659, 880], 180);
    this.add.text(36, 80, `${runtime.session.names.primaryName} + ${runtime.session.names.partnerName}`, {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#f8f4e8"
    });

    showResultOverlay({
      hook: card.hook,
      title: card.headline,
      body: card.body,
      insight: card.insight,
      score: card.score,
      signature: card.signature,
      signatureLabel: runtime.copy["result.signatureLabel"],
      shareHint: card.sharePrompt,
      shareLabel: runtime.copy["result.shareLabel"],
      progressTitle: runtime.copy[unlockCelebrated ? "result.progressUnlockTitle" : "result.progressTitle"],
      partnerName: runtime.session.names.partnerName,
      partnerLabel: runtime.copy["home.partnerLabel"],
      retryLabel: runtime.copy["result.retry"],
      rewardLabel: runtime.copy["result.reward"],
      meta: [
        { value: String(runtime.progress.rewardCoins), label: runtime.copy["home.rewards"] },
        { value: String(runtime.progress.collectedResultKeys.length), label: runtime.copy["home.collection"] }
      ],
      progressionItems,
      accent: card.accent,
      rewardVisible: runtime.canShowReward(),
      onRetry: (partnerName) => {
        const nextName = sanitizeName(partnerName) || runtime.session.names.partnerName;
        runtime.session = createReplayState(runtime.session, nextName);
        this.scene.start("TestScene");
      },
      onShare: async () => {
        const imageDataUrl = await buildShareCard({
          brandLabel: runtime.copy["app.title"],
          hook: card.hook,
          title: card.headline,
          score: card.score,
          body: card.body,
          insight: card.insight,
          signature: card.signature,
          signatureLabel: runtime.copy["result.signatureLabel"],
          sharePrompt: card.sharePrompt,
          names: `${runtime.session.names.primaryName} + ${runtime.session.names.partnerName}`,
          accent: card.accent
        });
        await runtime.share.share({
          title: card.headline,
          text: runtime.latestShareText(),
          imageDataUrl,
          filename: `${runtime.session.selectedTest.id}-${runtime.session.latestResult!.resultKey}.png`
        });
        runtime.analytics.track({
          name: "result_shared",
          payload: {
            testId: runtime.session.selectedTest.id,
            resultKey: runtime.session.latestResult!.resultKey
          }
        });
      },
      onReward: () => {
        runtime.analytics.track({
          name: "reward_prompt_viewed",
          payload: {
            testId: runtime.session.selectedTest.id,
            score: runtime.session.latestResult!.score
          }
        });
        this.scene.start("RewardScene");
      }
    });
  }

  private createParticles(accent: string): void {
    const color = Phaser.Display.Color.HexStringToColor(accent).color;
    for (let index = 0; index < 18; index += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(24, Math.max(48, this.scale.width - 24)),
        Phaser.Math.Between(140, Math.max(220, this.scale.height - 84)),
        Phaser.Math.Between(2, 5),
        color,
        0.65
      );
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(30, 90),
        alpha: 0,
        scale: { from: 0.8, to: 1.4 },
        duration: Phaser.Math.Between(1200, 2200),
        repeat: -1,
        delay: Phaser.Math.Between(0, 900)
      });
    }
  }
}
