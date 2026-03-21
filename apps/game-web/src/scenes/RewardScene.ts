import Phaser from "phaser";
import { createReplayState, sanitizeName } from "@nametests/core";
import { homeFeedCards, homeFeedUiCopy } from "@nametests/content-packs";
import { runtime } from "../GameRuntime";
import { showResultOverlay } from "../ui/overlays/resultOverlay";
import {
  resolveArtifactTemplate,
  resolveRemixTemplates,
  type ArtifactTemplate
} from "../ui/components/artifactPresentation";
import { buildShareCard } from "../ui/components/shareCard";
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

export class RewardScene extends Phaser.Scene {
  constructor() {
    super("RewardScene");
  }

  async create(): Promise<void> {
    runtime.recordSceneVisit("RewardScene");
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0x120f26);

    const outcome = await runtime.ads.showRewarded();
    if (outcome !== "granted" || !runtime.session.latestResult) {
      this.scene.start("ResultScene");
      return;
    }

    runtime.session = {
      ...runtime.session,
      rewardState: {
        rewardedSeen: true,
        alternateResultUnlocked: true
      }
    };
    runtime.analytics.track({ name: "reward_granted", payload: { testId: runtime.session.selectedTest.id } });

    const card = runtime.latestCard();
    const template = resolveArtifactTemplate(runtime.session.selectedTest);
    const remixOptions = resolveRemixTemplates(runtime.session.selectedTest).map((entry) => ({
      template: entry,
      label: this.getRemixLabel(entry)
    }));
    const partnerDraft = runtime.getResultDraftPartnerName() || runtime.session.names.partnerName;
    const retryPartnerVisible = runtime.session.selectedTest.prompts.some(
      (prompt) => prompt.type === "name" && prompt.id === "partnerName"
    );
    const nextStories = this.buildNextStories();
    const browseStories = this.buildBrowseStories(nextStories);

    showResultOverlay({
      socialBrandLabel: runtime.copy["app.title"],
      homeButtonLabel: runtime.copy["home.homeButton"] ?? "Home",
      languageLabel: runtime.copy["home.languageLabel"] ?? "Language",
      locales: runtime.getSupportedLocales(),
      currentLocale: runtime.locale,
      hook: card.hook,
      testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
      title: runtime.copy["result.secretTitle"],
      body: `${card.body} ${runtime.copy["result.secretBodySuffix"]}`,
      insight: `${card.insight} ${runtime.copy["result.secretInsightSuffix"]}`,
      score: card.score,
      signature: `${card.signature}-PLUS`,
      signatureLabel: runtime.copy["result.signatureLabel"],
      shareHint: card.sharePrompt,
      shareLabel: runtime.copy["result.shareLabel"],
      remixTitle: runtime.copy["result.remixTitle"] ?? "Remix this result",
      remixBody: runtime.copy["result.remixBody"] ?? "Try another visual version before you share it.",
      remixOptions,
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
      progressionItems: [],
      nextStories,
      browseStories,
      onPartnerDraftChange: (partnerName) => {
        runtime.setResultDraftPartnerName(partnerName);
      },
      accent: "#ffd166",
      template,
      rewardVisible: false,
      onGoHome: () => {
        runtime.clearHomeSelection();
        runtime.resetSceneHistory("HomeScene");
        this.scene.start("HomeScene");
      },
      onChangeLocale: async (nextLocale) => {
        await runtime.setLocale(nextLocale);
        this.scene.restart();
      },
      onSelectStory: (testId, storyId) => {
        runtime.setHomeSelection(testId, storyId);
        runtime.selectTest(testId, storyId, { allowLocked: true });
        this.scene.start("HomeScene");
      },
      onRetry: (partnerName) => {
        const nextName = sanitizeName(partnerName) || runtime.session.names.partnerName;
        runtime.session = createReplayState(runtime.session, nextName);
        this.scene.start("TestScene");
      },
      onStartNext: (testId, storyId, partnerName) => {
        const nextTest = runtime.state.allTests.find((test) => test.id === testId);
        const nextRequiresPartner =
          nextTest?.inputMode === "single-name" || nextTest?.inputMode === "tap-photo"
            ? false
            : nextTest?.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName") ?? true;
        const nextPartnerName = nextRequiresPartner ? sanitizeName(partnerName) : "";

        runtime.selectTest(testId, storyId, { allowLocked: true });
        runtime.startSession(runtime.session.names.primaryName, nextPartnerName);
        runtime.analytics.track({
          name: "test_started",
          payload: {
            testId: runtime.session.selectedTest.id
          }
        });
        this.scene.start("TestScene");
      },
      onShare: async (selectedTemplate, artifact) =>
        runtime.share.share({
          title: runtime.copy["result.secretTitle"],
          text: `${runtime.latestShareText()} ${runtime.copy["result.secretTitle"]}.`,
          imageDataUrl: await buildShareCard({
            brandLabel: runtime.copy["app.title"],
            hook: artifact.hook,
            testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
            title: artifact.title,
            score: card.score,
            body: artifact.body,
            insight: artifact.insight,
            signature: artifact.signature,
            signatureLabel: runtime.copy["result.signatureLabel"],
            sharePrompt: artifact.shareHint,
            names: this.formatNamesForDisplay(
              runtime.session.names.primaryName,
              runtime.session.names.partnerName,
              runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id
            ),
            accent: artifact.accent,
            template: selectedTemplate
          }),
          filename: `${runtime.session.selectedTest.id}-secret.png`
        }),
      onReward: () => undefined
    });
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

  private getRemixLabel(template: ArtifactTemplate): string {
    switch (template) {
      case "portrait":
        return runtime.copy["result.remixPortrait"] ?? "Portrait";
      case "headline":
        return runtime.copy["result.remixHeadline"] ?? "Headline";
      case "storybook":
        return runtime.copy["result.remixStorybook"] ?? "Storybook";
      case "spotlight":
        return runtime.copy["result.remixBadge"] ?? "Badge";
      case "tabloid":
        return runtime.copy["result.remixMagazine"] ?? "Magazine";
      case "cosmic":
      default:
        return runtime.copy["result.remixPoster"] ?? "Poster";
    }
  }

  private buildNextStories(): NextStory[] {
    const currentTestId = runtime.session.selectedTest.id;
    return this.buildCatalogStories()
      .filter((story) => story.testId !== currentTestId)
      .slice(0, 4);
  }

  private buildBrowseStories(nextStories: NextStory[]): BrowseStory[] {
    const quickStoryIds = new Set(nextStories.map((story) => story.id));
    return this.buildCatalogStories().filter((story) => !quickStoryIds.has(story.id));
  }

  private buildCatalogStories(): NextStory[] {
    const locale = runtime.locale;
    const feedItemsByTestId = new Map(runtime.getDiscoveryFeedItems().map((item) => [item.testId, item]));

    return homeFeedCards.flatMap((card) => {
      const test = runtime.state.allTests.find((entry) => entry.id === card.testId);
      if (!test) {
        return [];
      }

      const feedItem = feedItemsByTestId.get(card.testId);
      return [
        {
          id: feedItem?.id ?? `${card.id}-catalog`,
          testId: card.testId,
          imageUrl: homeFeedThumbs[feedItem?.imageKey ?? card.testId] ?? homeFeedThumbs[card.testId],
          tag: feedItem?.tag ?? card.tag[locale],
          title: feedItem?.title ?? card.title[locale],
          teaser: feedItem?.teaser ?? runtime.copy[test.subtitleKey] ?? card.title[locale],
          socialProof:
            feedItem?.socialProof ??
            `${homeFeedUiCopy.popularLabel[locale]} · ${runtime.copy[test.titleKey] ?? card.testId}`,
          testLabel: runtime.copy[test.titleKey] ?? card.testId,
          testSubtitle: runtime.copy[test.subtitleKey] ?? (feedItem?.teaser ?? card.title[locale]),
          requiresPartner:
            test.inputMode === "single-name" || test.inputMode === "tap-photo"
              ? false
              : test.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName"),
          partnerLabel:
            test.prompts.find((prompt) => prompt.type === "name" && prompt.id === "partnerName")?.label ??
            runtime.copy["home.partnerLabel"]
        }
      ];
    });
  }
}
