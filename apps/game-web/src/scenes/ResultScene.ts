import Phaser from "phaser";
import { runtime } from "../GameRuntime";
import { createReplayState, isNameValid, sanitizeName } from "@nametests/core";
import { showResultOverlay } from "../ui/overlays/resultOverlay";
import { buildShareCard } from "../ui/components/shareCard";
import { playToneSequence } from "../ui/transitions/playTone";
import { homeFeedThumbs } from "../assets/feed";

type NextStory = {
  id: string;
  testId: string;
  imageUrl: string;
  tag: string;
  title: string;
  teaser: string;
  socialProof: string;
  testLabel: string;
  testSubtitle: string;
  requiresPartner: boolean;
  partnerLabel: string;
};

type BrowseStory = NextStory;

type ResultPosterTemplate = "cosmic" | "spotlight" | "tabloid";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(): void {
    runtime.recordSceneVisit("ResultScene");
    const width = this.scale.width;
    const height = this.scale.height;
    const card = runtime.latestCard();
    const template = this.getPosterTemplate();
    const progressionSummary = runtime.session.progressSummary;
    const unlockCelebrated = Boolean(progressionSummary?.newlyUnlockedTestIds?.length);
    const nextStories = this.buildNextStories();
    const browseStories = this.buildBrowseStories(nextStories);
    const retryPartnerVisible = runtime.session.selectedTest.prompts.some(
      (prompt) => prompt.type === "name" && prompt.id === "partnerName"
    );
    const partnerDraft = runtime.getResultDraftPartnerName() || runtime.session.names.partnerName;
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
    this.add
      .text(
        36,
        80,
        this.formatNamesForDisplay(
          runtime.session.names.primaryName,
          runtime.session.names.partnerName,
          runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id
        ),
        {
          fontFamily: "Georgia",
          fontSize: "26px",
          color: "#f8f4e8"
        }
      );

    showResultOverlay({
      socialBrandLabel: runtime.copy["app.title"],
      socialSectionLabel: runtime.copy["result.moreStories"],
      socialStatusLabel: runtime.copy["result.shareLabel"],
      socialMetaLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
      hook: card.hook,
      testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
      title: card.headline,
      body: card.body,
      insight: card.insight,
      score: card.score,
      signature: card.signature,
      signatureLabel: runtime.copy["result.signatureLabel"],
      shareHint: card.sharePrompt,
      shareLabel: runtime.copy["result.shareLabel"],
      progressTitle: runtime.copy[unlockCelebrated ? "result.progressUnlockTitle" : "result.progressTitle"],
      partnerName: partnerDraft,
      partnerLabel: runtime.copy["home.partnerLabel"],
      retryPartnerVisible,
      retryLabel: runtime.copy["result.retry"],
      rewardLabel: runtime.copy["result.reward"],
      continueTitle: runtime.copy["result.continueTitle"],
      continueBody: runtime.copy["result.continueBody"],
      nextStoryLabel: runtime.copy["result.moreStories"],
      nextStoryStartLabel: runtime.copy["result.playNext"],
      keepNameLabel: runtime.copy["result.keepName"],
      primaryName: runtime.session.names.primaryName,
      meta: [
        { value: String(runtime.progress.rewardCoins), label: runtime.copy["home.rewards"] },
        { value: String(runtime.progress.collectedResultKeys.length), label: runtime.copy["home.collection"] }
      ],
      progressionItems,
      nextStories,
      browseStories,
      onPartnerDraftChange: (partnerName) => {
        runtime.setResultDraftPartnerName(partnerName);
      },
      accent: card.accent,
      template,
      rewardVisible: runtime.canShowReward(),
      onRetry: (partnerName) => {
        const nextName = sanitizeName(partnerName) || runtime.session.names.partnerName;
        runtime.session = createReplayState(runtime.session, nextName);
        this.scene.start("TestScene");
      },
      onStartNext: (testId, storyId, partnerName) => {
        const nextTest = runtime.state.allTests.find((test) => test.id === testId);
        const nextRequiresPartner = nextTest?.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName") ?? true;
        const nextPartnerName = nextRequiresPartner ? sanitizeName(partnerName) : "";
        const primaryName = runtime.session.names.primaryName;
        const nextRequiresPrimary = nextTest?.prompts.some(
          (prompt) => prompt.type === "name" && prompt.id === "primaryName"
        ) ?? true;
        if (nextRequiresPrimary && !isNameValid(primaryName)) {
          window.alert(runtime.copy["home.validationPrimaryName"] ?? runtime.copy["home.validationNames"]);
          return;
        }
        if (nextRequiresPartner && !isNameValid(nextPartnerName)) {
          window.alert(runtime.copy["home.validationNames"]);
          return;
        }

        runtime.selectTest(testId, storyId);
        runtime.startSession(primaryName, nextPartnerName);
        runtime.analytics.track({
          name: "test_started",
          payload: {
            testId: runtime.session.selectedTest.id
          }
        });
        this.scene.start("TestScene");
      },
      onShare: async () => {
        const imageDataUrl = await buildShareCard({
          brandLabel: runtime.copy["app.title"],
          hook: card.hook,
          testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
          title: card.headline,
          score: card.score,
          body: card.body,
          insight: card.insight,
          signature: card.signature,
          signatureLabel: runtime.copy["result.signatureLabel"],
          sharePrompt: card.sharePrompt,
          names: this.formatNamesForDisplay(
            runtime.session.names.primaryName,
            runtime.session.names.partnerName,
            runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id
          ),
          accent: card.accent,
          template
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

  private getPosterTemplate(): ResultPosterTemplate {
    const symbol = runtime.session.selectedTest.art.symbol;
    switch (symbol) {
      case "badge":
        return "spotlight";
      case "storm":
        return "tabloid";
      default:
        return "cosmic";
    }
  }

  private buildNextStories(): NextStory[] {
    const availableTestIds = new Set(runtime.getAvailableTests().map((test) => test.id));
    const currentTestId = runtime.session.selectedTest.id;
    const testsById = new Map(runtime.state.allTests.map((test) => [test.id, test]));
    const uniqueStories = new Map<string, NextStory>();

    for (const item of runtime.getDiscoveryFeedItems()) {
      if (!availableTestIds.has(item.testId) || item.testId === currentTestId) {
        continue;
      }

      if (uniqueStories.has(item.testId)) {
        continue;
      }

      const test = testsById.get(item.testId);
      if (!test) {
        continue;
      }

      uniqueStories.set(item.testId, {
        id: item.id,
        testId: item.testId,
        imageUrl: homeFeedThumbs[item.imageKey] ?? homeFeedThumbs[item.testId],
        tag: item.tag,
        title: item.title,
        teaser: item.teaser,
        socialProof: item.socialProof,
        testLabel: runtime.copy[test.titleKey] ?? item.testId,
        testSubtitle: runtime.copy[test.subtitleKey] ?? item.teaser,
        requiresPartner: test.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName"),
        partnerLabel:
          test.prompts.find((prompt) => prompt.type === "name" && prompt.id === "partnerName")?.label ??
          runtime.copy["home.partnerLabel"]
      });
    }

    return [...uniqueStories.values()].slice(0, 4);
  }

  private buildBrowseStories(nextStories: NextStory[]): BrowseStory[] {
    const availableTestIds = new Set(runtime.getAvailableTests().map((test) => test.id));
    const currentTestId = runtime.session.selectedTest.id;
    const testsById = new Map(runtime.state.allTests.map((test) => [test.id, test]));
    const quickStoryIds = new Set(nextStories.map((story) => story.id));
    const browseStories: BrowseStory[] = [];

    for (const item of runtime.getDiscoveryFeedItems()) {
      if (!availableTestIds.has(item.testId) || item.testId === currentTestId || quickStoryIds.has(item.id)) {
        continue;
      }

      const test = testsById.get(item.testId);
      if (!test) {
        continue;
      }

      browseStories.push({
        id: item.id,
        testId: item.testId,
        imageUrl: homeFeedThumbs[item.imageKey] ?? homeFeedThumbs[item.testId],
        tag: item.tag,
        title: item.title,
        teaser: item.teaser,
        socialProof: item.socialProof,
        testLabel: runtime.copy[test.titleKey] ?? item.testId,
        testSubtitle: runtime.copy[test.subtitleKey] ?? item.teaser,
        requiresPartner: test.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName"),
        partnerLabel:
          test.prompts.find((prompt) => prompt.type === "name" && prompt.id === "partnerName")?.label ??
          runtime.copy["home.partnerLabel"]
      });

      if (browseStories.length >= 6) {
        break;
      }
    }

    return browseStories;
  }

  private formatNamesForDisplay(primaryName: string, partnerName: string, fallbackLabel: string): string {
    if (primaryName && partnerName) {
      return `${primaryName} + ${partnerName}`;
    }

    if (primaryName) {
      return primaryName;
    }

    return fallbackLabel;
  }
}
