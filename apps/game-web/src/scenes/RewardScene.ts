import Phaser from "phaser";
import { createReplayState, sanitizeName } from "@nametests/core";
import { runtime } from "../GameRuntime";
import { showResultOverlay } from "../ui/overlays/resultOverlay";
import { buildShareCard } from "../ui/components/shareCard";

export class RewardScene extends Phaser.Scene {
  constructor() {
    super("RewardScene");
  }

  async create(): Promise<void> {
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0x120f26);
    this.add.text(width / 2, height / 2 - 42, "Unlocking secret reading...", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#f8f4e8"
    }).setOrigin(0.5);

    const outcome = await runtime.ads.showRewarded();
    if (outcome !== "granted" || !runtime.session.latestResult) {
      this.scene.start("ResultScene");
      return;
    }

    runtime.session.rewardState = {
      rewardedSeen: true,
      alternateResultUnlocked: true
    };
    runtime.analytics.track({ name: "reward_granted", payload: { testId: runtime.session.selectedTest.id } });

    const card = runtime.latestCard();
    showResultOverlay({
      title: runtime.copy["result.secretTitle"],
      body: `${card.body} Secret reading: your names rise when you stay bold, playful, and curious.`,
      insight: `${card.insight} This rare variant is designed for replay and sharing.`,
      score: card.score,
      signature: `${card.signature}-PLUS`,
      partnerName: runtime.session.names.partnerName,
      partnerLabel: runtime.copy["home.partnerLabel"],
      meta: [
        { value: String(runtime.progress.rewardCoins), label: runtime.copy["home.rewards"] },
        { value: String(runtime.progress.collectedResultKeys.length), label: runtime.copy["home.collection"] }
      ],
      accent: "#ffd166",
      rewardVisible: false,
      onRetry: (partnerName) => {
        const nextName = sanitizeName(partnerName) || runtime.session.names.partnerName;
        runtime.session = createReplayState(runtime.session, nextName);
        this.scene.start("TestScene");
      },
      onShare: async () =>
        runtime.share.share({
          title: runtime.copy["result.secretTitle"],
          text: `${runtime.latestShareText()} Secret reading unlocked.`,
          imageDataUrl: await buildShareCard({
            title: runtime.copy["result.secretTitle"],
            score: card.score,
            body: `${card.body} Secret reading unlocked.`,
            insight: `${card.insight} Secret reading unlocked.`,
            signature: `${card.signature}-PLUS`,
            names: `${runtime.session.names.primaryName} + ${runtime.session.names.partnerName}`,
            accent: "#ffd166"
          }),
          filename: `${runtime.session.selectedTest.id}-secret.png`
        }),
      onReward: () => undefined
    });
  }
}
