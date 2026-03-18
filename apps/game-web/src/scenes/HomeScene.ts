import Phaser from "phaser";
import { isNameValid, sanitizeName } from "@nametests/core";
import { runtime } from "../GameRuntime";
import { showHomeOverlay } from "../ui/overlays/homeOverlay";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create(): void {
    this.drawBackdrop();
    const width = this.scale.width;

    const featured = runtime.session.selectedTest;
    this.add.text(36, 96, "COSMIC", { fontFamily: "Georgia", fontSize: "28px", color: "#ffd166" });
    this.add.text(36, 126, "MATCH", { fontFamily: "Georgia", fontSize: "52px", color: "#f8f4e8" });
    this.add.text(36, 214, "Daily feature, unlockable tests,\nand flavored viral results.", {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#dfe8ff",
      lineSpacing: 10
    });

    const daily = runtime.getDailyFeatured();
    const activeEvent = runtime.getActiveEvent();
    this.add.text(36, 292, `${runtime.copy["home.daily"]}: ${runtime.copy[daily.titleKey]}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#ffd166"
    });
    this.add.text(36, 318, `${runtime.copy["home.event"]}: ${activeEvent.name}`, {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#9ad1ff"
    });

    showHomeOverlay({
      title: runtime.copy[featured.titleKey],
      subtitle: runtime.copy[featured.subtitleKey],
      dailyLabel: `${runtime.copy["home.daily"]}: ${runtime.copy[daily.titleKey]}`,
      eventLabel: runtime.copy["home.event"],
      eventTheme: activeEvent.theme,
      primaryLabel: runtime.copy["home.primaryLabel"],
      partnerLabel: runtime.copy["home.partnerLabel"],
      streakLabel: runtime.copy["home.streak"],
      sessionsLabel: runtime.copy["home.sessions"],
      rewardsLabel: runtime.copy["home.rewards"],
      collectionLabel: runtime.copy["home.collection"],
      streakValue: runtime.progress.streak,
      sessionsValue: runtime.progress.sessionsPlayed,
      rewardValue: runtime.progress.rewardCoins,
      collectionValue: runtime.progress.collectedResultKeys.length,
      dailyRewardCoins: runtime.getDailyRewardCoins(),
      tests: runtime.state.allTests.map((test) => ({
        id: test.id,
        label: runtime.copy[test.titleKey],
        selected: test.id === featured.id,
        lockedLabel: runtime.getUnlockLabel(test)
      })),
      onSelectTest: (testId) => {
        runtime.selectTest(testId);
        this.scene.restart();
      },
      onSubmit: (primaryName, partnerName) => {
        const left = sanitizeName(primaryName);
        const right = sanitizeName(partnerName);

        if (!isNameValid(left) || !isNameValid(right)) {
          window.alert("Please enter two names with at least 2 letters.");
          return;
        }

        runtime.startSession(left, right);
        runtime.analytics.track({ name: "test_started", payload: { testId: featured.id } });
        this.scene.start("TestScene");
      }
    });
  }

  private drawBackdrop(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0f1630, 0x0f1630, 0x17244d, 0x17244d, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.fillStyle(0xffd166, 0.14);
    graphics.fillCircle(width - 76, 120, Math.min(90, width * 0.18));
    graphics.fillStyle(0x63b3ff, 0.09);
    graphics.fillCircle(Math.max(92, width * 0.2), height - 224, Math.min(120, width * 0.26));
  }
}
