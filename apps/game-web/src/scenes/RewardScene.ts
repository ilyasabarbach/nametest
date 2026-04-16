import Phaser from "phaser";
import type { ArtifactRemixRequest } from "@nametests/backend-contracts";
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
import { getThemePreference, setThemePreference } from "../ui/themePreference";

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
    const aiRemixEnabled = Boolean(runtime.session.selectedTest.imageRecipeId);
    const profilePhotoEnabled = aiRemixEnabled && runtime.canUsePlatformProfilePhoto();
    const secretBody = `${card.body} ${runtime.copy["result.secretBodySuffix"]}`;
    const secretInsight = `${card.insight} ${runtime.copy["result.secretInsightSuffix"]}`;
    const initialPosterImageDataUrl =
      aiRemixEnabled && runtime.getActiveProfilePhotoDataUrl()
        ? runtime.buildResultPosterImage({
            title: runtime.copy["result.secretTitle"],
            body: secretBody,
            insight: secretInsight,
            accent: "#ffd166"
          })
        : undefined;
    const partnerDraft = runtime.getResultDraftPartnerName() || runtime.session.names.partnerName;
    const retryPartnerVisible = runtime.session.selectedTest.prompts.some(
      (prompt) => prompt.type === "name" && prompt.id === "partnerName"
    );
    const nextStories = this.buildNextStories();
    const browseStories = this.buildBrowseStories(nextStories);
    const showTelegramMeta = runtime.platform.id !== "telegram";

    showResultOverlay({
      socialBrandLabel: runtime.copy["app.title"],
      homeButtonLabel: runtime.copy["home.homeButton"] ?? "Home",
      languageLabel: runtime.copy["home.languageLabel"] ?? "Language",
      themeLabel: runtime.copy["settings.themeLabel"] ?? "Theme",
      themePreference: getThemePreference(),
      locales: runtime.getSupportedLocales(),
      currentLocale: runtime.locale,
      hook: card.hook,
      testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
      title: runtime.copy["result.secretTitle"],
      body: secretBody,
      insight: secretInsight,
      score: card.score,
      signature: `${card.signature}-PLUS`,
      signatureLabel: runtime.copy["result.signatureLabel"],
      shareHint: card.sharePrompt,
      shareLabel:
        runtime.platform.id === "telegram"
          ? runtime.copy["result.shareToChatLabel"] ?? "Share to chat"
          : runtime.copy["result.shareLabel"],
      shareStoryLabel: runtime.copy["result.shareToStoryLabel"] ?? "Share to story",
      remixTitle: runtime.copy["result.remixTitle"] ?? "Remix this result",
      remixBody: runtime.copy["result.remixBody"] ?? "Try another visual version before you share it.",
      remixOptions,
      aiRemixLabel: runtime.copy["result.aiRemixLabel"] ?? "Make AI version",
      profilePhotoLabel: runtime.getProfilePhotoActionLabel(),
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
      meta: showTelegramMeta
        ? [
            { value: String(runtime.progress.rewardCoins), label: runtime.copy["home.rewards"] },
            { value: String(runtime.progress.collectedResultKeys.length), label: runtime.copy["home.collection"] }
          ]
        : [],
      progressionItems: [],
      nextStories,
      browseStories,
      onPartnerDraftChange: (partnerName) => {
        runtime.setResultDraftPartnerName(partnerName);
      },
      accent: "#ffd166",
      template,
      posterImageDataUrl: initialPosterImageDataUrl,
      badgeLabel: initialPosterImageDataUrl ? (runtime.copy["result.googlePhotoReady"] ?? "Google photo active") : "",
      onRequestAiRemix: aiRemixEnabled
        ? async (selectedTemplate) => {
            if (!runtime.session.latestResult) {
              return null;
            }
            const request: ArtifactRemixRequest = {
              testId: runtime.session.selectedTest.id,
              recipeId: runtime.session.selectedTest.artifactRecipeId ?? runtime.session.selectedTest.id,
              imageRecipeId: runtime.session.selectedTest.imageRecipeId,
              locale: runtime.locale,
              template: selectedTemplate,
              names: {
                primaryName: runtime.session.names.primaryName,
                partnerName: runtime.session.names.partnerName
              },
              presentPhotoDataUrl: runtime.getActiveProfilePhotoDataUrl(),
              result: {
                resultKey: runtime.session.latestResult.resultKey,
                score: card.score,
                hook: card.hook,
                title: runtime.copy["result.secretTitle"],
                body: secretBody,
                insight: secretInsight,
                signature: `${card.signature}-PLUS`,
                sharePrompt: card.sharePrompt
              }
            };

            const response = await runtime.requestArtifactRemix(request);
            return response
              ? {
                  hook: response.artifact.hook,
                  title: response.artifact.title,
                  body: response.artifact.body,
                  insight: response.artifact.insight,
                  signature: response.artifact.signature,
                  shareHint: response.artifact.sharePrompt,
                  accent: response.artifact.accent ?? "#ffd166",
                  badgeLabel: response.artifact.badgeLabel ?? "AI version active",
                  posterImageDataUrl: response.artifact.posterImageDataUrl
                }
              : null;
          }
        : undefined,
      onUseProfilePhoto: profilePhotoEnabled
        ? async (_selectedTemplate, artifact) => {
            const profile = await runtime.connectPlatformProfilePhoto();
            if (!profile) {
              window.alert(runtime.copy["result.profilePhotoError"] ?? runtime.copy["result.googlePhotoError"] ?? "Profile photo could not be loaded right now.");
              return null;
            }

            return {
              posterImageDataUrl: runtime.buildResultPosterImage({
                title: artifact.title,
                body: artifact.body,
                insight: artifact.insight,
                accent: artifact.accent
              }),
              badgeLabel: runtime.copy["result.googlePhotoReady"] ?? "Google photo active"
            };
          }
        : undefined,
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
      onChangeTheme: (preference) => {
        setThemePreference(preference);
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
        const nextTest = runtime.getAvailableTests().find((test) => test.id === testId);
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
      onShare: async (selectedTemplate, artifact) => {
        const imageDataUrl =
          runtime.platform.id === "telegram"
            ? undefined
            : await buildShareCard({
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
                template: selectedTemplate,
                posterImageDataUrl: artifact.posterImageDataUrl
              });
        runtime.analytics.track({
          name: "share_started",
          payload: {
            platform: runtime.platform.id,
            surface: "chat",
            testId: runtime.session.selectedTest.id,
            resultKey: runtime.session.latestResult!.resultKey
          }
        });
        if (runtime.platform.id === "telegram") {
          window.sessionStorage.setItem(
            "telegram-pending-share-return",
            JSON.stringify({
              surface: "chat",
              testId: runtime.session.selectedTest.id,
              resultKey: runtime.session.latestResult!.resultKey
            })
          );
        }
        await runtime.shareResultArtifact({
          title: runtime.copy["result.secretTitle"],
          text: `${runtime.latestShareText()} ${runtime.copy["result.secretTitle"]}.`,
          imageDataUrl,
          filename: `${runtime.session.selectedTest.id}-secret.png`,
          template: selectedTemplate
        });
        runtime.analytics.track({
          name: "share_sent",
          payload: {
            platform: runtime.platform.id,
            surface: "chat",
            testId: runtime.session.selectedTest.id,
            resultKey: runtime.session.latestResult!.resultKey
          }
        });
      },
      onShareToStory: runtime.canShareToStory()
        ? async (selectedTemplate, artifact) => {
            const imageDataUrl = await buildShareCard({
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
              template: selectedTemplate,
              posterImageDataUrl: artifact.posterImageDataUrl
            });
            runtime.analytics.track({
              name: "share_started",
              payload: {
                platform: runtime.platform.id,
                surface: "story",
                testId: runtime.session.selectedTest.id,
                resultKey: runtime.session.latestResult!.resultKey
              }
            });
            if (runtime.platform.id === "telegram") {
              window.sessionStorage.setItem(
                "telegram-pending-share-return",
                JSON.stringify({
                  surface: "story",
                  testId: runtime.session.selectedTest.id,
                  resultKey: runtime.session.latestResult!.resultKey
                })
              );
            }
            const shared = await runtime.shareResultStoryArtifact({
              title: runtime.copy["result.secretTitle"],
              text: `${runtime.latestShareText()} ${runtime.copy["result.secretTitle"]}.`,
              imageDataUrl,
              filename: `${runtime.session.selectedTest.id}-secret.png`,
              template: selectedTemplate
            });
            if (shared) {
              runtime.analytics.track({
                name: "share_sent",
                payload: {
                  platform: runtime.platform.id,
                  surface: "story",
                  testId: runtime.session.selectedTest.id,
                  resultKey: runtime.session.latestResult!.resultKey
                }
              });
            }
          }
        : undefined,
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
      const test = runtime.getAvailableTests().find((entry) => entry.id === card.testId);
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
