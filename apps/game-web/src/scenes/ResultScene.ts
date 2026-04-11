import Phaser from "phaser";
import type { ArtifactRemixRequest } from "@nametests/backend-contracts";
import { runtime } from "../GameRuntime";
import { createReplayState, isNameValid, sanitizeName } from "@nametests/core";
import { showResultOverlay } from "../ui/overlays/resultOverlay";
import { buildShareCard } from "../ui/components/shareCard";
import {
  resolveArtifactTemplate,
  resolveRemixTemplates,
  type ArtifactTemplate
} from "../ui/components/artifactPresentation";
import { playToneSequence } from "../ui/transitions/playTone";
import { homeFeedCards, homeFeedUiCopy } from "@nametests/content-packs";
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

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(): void {
    runtime.recordSceneVisit("ResultScene");
    const width = this.scale.width;
    const height = this.scale.height;
    const card = runtime.latestCard();
    const template = resolveArtifactTemplate(runtime.session.selectedTest);
    const remixOptions = resolveRemixTemplates(runtime.session.selectedTest).map((entry) => ({
      template: entry,
      label: this.getRemixLabel(entry)
    }));
    const aiRemixEnabled = Boolean(runtime.session.selectedTest.imageRecipeId);
    const profilePhotoEnabled = aiRemixEnabled && runtime.canUsePlatformProfilePhoto();
    const initialPosterImageDataUrl =
      aiRemixEnabled && runtime.getActiveProfilePhotoDataUrl()
        ? runtime.buildResultPosterImage({
            title: card.headline,
            body: card.body,
            insight: card.insight,
            accent: card.accent
          })
        : undefined;
    const progressionSummary = runtime.session.progressSummary;
    const nextStories = this.buildNextStories();
    const browseStories = this.buildBrowseStories(nextStories);
    const showTelegramMeta = runtime.platform.id !== "telegram";
    const retryPartnerVisible = runtime.session.selectedTest.prompts.some(
      (prompt) => prompt.type === "name" && prompt.id === "partnerName"
    );
    const partnerDraft = runtime.getResultDraftPartnerName() || runtime.session.names.partnerName;
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
      homeButtonLabel: runtime.copy["home.homeButton"] ?? "Home",
      languageLabel: runtime.copy["home.languageLabel"] ?? "Language",
      locales: runtime.getSupportedLocales(),
      currentLocale: runtime.locale,
      hook: card.hook,
      testLabel: runtime.copy[runtime.session.selectedTest.titleKey] ?? runtime.session.selectedTest.id,
      title: card.headline,
      body: card.body,
      insight: card.insight,
      score: card.score,
      signature: card.signature,
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
      retryLabel: runtime.isViewingSharedResult() 
        ? (runtime.copy["result.makeYours"] ?? "✨ Play this test")
        : runtime.copy["result.retry"],
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
      accent: card.accent,
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
                title: card.headline,
                body: card.body,
                insight: card.insight,
                signature: card.signature,
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
                  accent: response.artifact.accent ?? card.accent,
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
      rewardVisible: runtime.canShowReward(),
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
        const nextTest = runtime.getAvailableTests().find((test) => test.id === testId);
        const nextRequiresPartner =
          nextTest?.inputMode === "single-name" || nextTest?.inputMode === "tap-photo"
            ? false
            : nextTest?.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName") ?? true;
        const nextPartnerName = nextRequiresPartner ? sanitizeName(partnerName) : "";
        const primaryName = runtime.session.names.primaryName;
        const nextRequiresPrimary =
          nextTest?.inputMode === "tap-photo"
            ? false
            : nextTest?.prompts.some((prompt) => prompt.type === "name" && prompt.id === "primaryName") ?? true;
        if (nextRequiresPrimary && !isNameValid(primaryName)) {
          window.alert(runtime.copy["home.validationPrimaryName"] ?? runtime.copy["home.validationNames"]);
          return;
        }
        if (nextRequiresPartner && !isNameValid(nextPartnerName)) {
          window.alert(runtime.copy["home.validationNames"]);
          return;
        }

        runtime.selectTest(testId, storyId, { allowLocked: true });
        runtime.startSession(primaryName, nextPartnerName);
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
        
        const shortId = await runtime.saveSessionResult(artifact, selectedTemplate) ?? undefined;
        
        await runtime.shareResultArtifact({
          title: card.headline,
          text: runtime.latestShareText(),
          imageDataUrl,
          filename: `${runtime.session.selectedTest.id}-${runtime.session.latestResult!.resultKey}.png`,
          template: selectedTemplate,
          shortId
        });
        runtime.analytics.track({
          name: "result_shared",
          payload: {
            testId: runtime.session.selectedTest.id,
            resultKey: runtime.session.latestResult!.resultKey
          }
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
            
            const shortId = await runtime.saveSessionResult(artifact, selectedTemplate) ?? undefined;
            
            const shared = await runtime.shareResultStoryArtifact({
              title: card.headline,
              text: runtime.latestShareText(),
              imageDataUrl,
              filename: `${runtime.session.selectedTest.id}-${runtime.session.latestResult!.resultKey}.png`,
              template: selectedTemplate,
              shortId
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
}
