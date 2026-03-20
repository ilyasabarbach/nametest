import Phaser from "phaser";
import { homeFeedUiCopy } from "@nametests/content-packs";
import type { DiscoveryFeedItemPayload } from "@nametests/backend-contracts";
import { isNameValid, sanitizeName, type TestInputValue } from "@nametests/core";
import { homeFeedThumbs } from "../assets/feed";
import { runtime } from "../GameRuntime";
import { showHomeOverlay } from "../ui/overlays/homeOverlay";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create(): void {
    runtime.recordSceneVisit("HomeScene");
    this.drawBackdrop();
    const locale = runtime.locale;
    const daily = runtime.getDailyFeatured();
    const activeEvent = runtime.getActiveEvent();
    const nextUnlock = runtime.getNextUnlock();
    const feedItems = this.decorateFeedItems(runtime.getDiscoveryFeedItems());
    const homeDraftNames = runtime.getHomeDraftNames();
    const homeSelection = runtime.getHomeSelection();

    const selectedTestId = homeSelection.selectedTestId;

    showHomeOverlay({
      socialBrandLabel: runtime.copy["app.title"],
      socialSectionLabel: homeFeedUiCopy.homeLabel[locale],
      socialStatusLabel: homeFeedUiCopy.popularLabel[locale],
      socialMetaLabel: `${homeFeedUiCopy.hotLabel[locale]} · ${runtime.copy[daily.titleKey]}`,
      homeLabel: homeFeedUiCopy.homeLabel[locale],
      heroTitle: homeFeedUiCopy.heroTitle[locale],
      heroBody: homeFeedUiCopy.heroBody[locale],
      languageLabel: homeFeedUiCopy.languageLabel[locale],
      hotLabel: homeFeedUiCopy.hotLabel[locale],
      popularLabel: homeFeedUiCopy.popularLabel[locale],
      composerLabel: homeFeedUiCopy.composerLabel[locale],
      selectedLabel: homeFeedUiCopy.selectedLabel[locale],
      startLabel: homeFeedUiCopy.startLabel[locale],
      dailyLabel: `${runtime.copy["home.daily"]}: ${runtime.copy[daily.titleKey]}`,
      eventLabel: runtime.copy["home.event"],
      eventTheme: activeEvent.name,
      primaryLabel: runtime.copy["home.primaryLabel"],
      partnerLabel: runtime.copy["home.partnerLabel"],
      privacyLabel: runtime.copy["home.privacyHint"],
      streakLabel: runtime.copy["home.streak"],
      sessionsLabel: runtime.copy["home.sessions"],
      rewardsLabel: runtime.copy["home.rewards"],
      collectionLabel: runtime.copy["home.collection"],
      streakValue: runtime.progress.streak,
      sessionsValue: runtime.progress.sessionsPlayed,
      rewardValue: runtime.progress.rewardCoins,
      collectionValue: runtime.progress.collectedResultKeys.length,
      dailyRewardCoins: runtime.getDailyRewardCoins(),
      locales: runtime.getSupportedLocales(),
      currentLocale: locale,
      nextUnlock: nextUnlock
        ? {
            label: nextUnlock.label,
            title: runtime.copy["home.nextUnlock"],
            remainingLabel:
              nextUnlock.sessionsRemaining === 0
                ? runtime.copy["home.nextUnlockReady"]
                : runtime.copy[
                    nextUnlock.sessionsRemaining === 1
                      ? "home.nextUnlockRemaining"
                      : "home.nextUnlockRemainingPlural"
                  ].replace("{count}", String(nextUnlock.sessionsRemaining)),
            progressLabel: runtime.copy["home.nextUnlockProgress"]
              .replace("{current}", String(nextUnlock.sessionsPlayedTowardUnlock))
              .replace("{target}", String(nextUnlock.unlockAtSessions)),
            progressValue: nextUnlock.unlockAtSessions === 0 ? 1 : nextUnlock.sessionsPlayedTowardUnlock / nextUnlock.unlockAtSessions
          }
        : null,
      tests: runtime.state.allTests.map((test) => {
        const primaryPrompt = test.prompts.find(
          (prompt): prompt is Extract<(typeof test.prompts)[number], { type: "name" }> =>
            prompt.type === "name" && prompt.id === "primaryName"
        );
        const partnerPrompt = test.prompts.find(
          (prompt): prompt is Extract<(typeof test.prompts)[number], { type: "name" }> =>
            prompt.type === "name" && prompt.id === "partnerName"
        );
        const hasNamePrompt = test.prompts.some((prompt) => prompt.type === "name");

        return {
          id: test.id,
          label: runtime.copy[test.titleKey],
          subtitle: runtime.copy[test.subtitleKey],
          selected: test.id === selectedTestId,
          lockedLabel: runtime.getUnlockLabel(test),
          primaryPromptLabel: runtime.copy["home.primaryLabel"],
          primaryPromptPlaceholder: primaryPrompt?.placeholder ?? "",
          partnerPromptLabel: runtime.copy["home.partnerLabel"],
          partnerPromptPlaceholder: partnerPrompt?.placeholder,
          requiresPartner: Boolean(partnerPrompt),
          interactionMode: hasNamePrompt ? "form" : "tap",
          tapLabel: runtime.copy["home.tapPhotoCta"]
        };
      }),
      feedItems,
      feedLoadingLabel: runtime.copy["feed.loadingMore"],
      initialSelectedFeedItemId: homeSelection.selectedFeedItemId,
      onSelectTest: (testId, feedItemId) => {
        runtime.setHomeSelection(testId, feedItemId);
        const selectedTest = runtime.state.allTests.find((test) => test.id === testId);
        if (selectedTest && !runtime.getUnlockLabel(selectedTest)) {
          runtime.selectTest(testId, feedItemId);
        }
      },
      onChangeLocale: async (nextLocale) => {
        await runtime.setLocale(nextLocale);
        this.scene.restart();
      },
      onLoadMore: async () => {
        const items = await runtime.loadMoreDiscoveryFeed();
        return {
          items: this.decorateFeedItems(items),
          hasMore: runtime.hasMoreDiscoveryFeed()
        };
      },
      hasMoreFeed: runtime.hasMoreDiscoveryFeed(),
      defaultPrimaryName: homeDraftNames.primaryName || runtime.session.names.primaryName,
      defaultPartnerName: homeDraftNames.partnerName || runtime.session.names.partnerName,
      onDraftChange: (primaryName, partnerName) => {
        runtime.setHomeDraftNames(primaryName, partnerName);
      },
      onSubmit: (selectedTestId, selectedFeedItemId, primaryName, partnerName) => {
        const selectedTest = runtime.state.allTests.find((test) => test.id === selectedTestId);
        const hasPrimaryPrompt = selectedTest?.prompts.some(
          (prompt) => prompt.type === "name" && prompt.id === "primaryName"
        ) ?? true;
        const requiresPartner = selectedTest?.prompts.some((prompt) => prompt.type === "name" && prompt.id === "partnerName") ?? true;
        const left = sanitizeName(primaryName);
        const right = requiresPartner ? sanitizeName(partnerName) : "";

        if (hasPrimaryPrompt && !isNameValid(left)) {
          window.alert(runtime.copy["home.validationPrimaryName"] ?? runtime.copy["home.validationNames"]);
          return;
        }

        if (requiresPartner && !isNameValid(right)) {
          window.alert(runtime.copy["home.validationNames"]);
          return;
        }

        const inputValues: Record<string, TestInputValue> = hasPrimaryPrompt
          ? {
              primaryName: left,
              partnerName: right
            }
          : {
              tapSeed: selectedFeedItemId || selectedTestId,
              revealSeed: selectedTestId
            };

        runtime.selectTest(selectedTestId, selectedFeedItemId);
        runtime.startSession(hasPrimaryPrompt ? left : "", right, inputValues);
        runtime.analytics.track({ name: "test_started", payload: { testId: runtime.session.selectedTest.id } });
        this.scene.start("TestScene");
      }
    });
  }

  private drawBackdrop(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xfffbf5, 0xfffbf5, 0xf3ece3, 0xf3ece3, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.fillStyle(0xffc58f, 0.22);
    graphics.fillCircle(width - 90, 150, Math.min(104, width * 0.17));
    graphics.fillStyle(0xff8c66, 0.14);
    graphics.fillCircle(width * 0.18, height * 0.22, Math.min(140, width * 0.22));
    graphics.fillStyle(0xf0d7b7, 0.22);
    graphics.fillCircle(width * 0.78, height * 0.76, Math.min(180, width * 0.28));

    this.add.text(26, 34, runtime.copy["home.brand"], {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#b8562d"
    }).setAlpha(0.9);
  }

  private decorateFeedItems(items: DiscoveryFeedItemPayload[]) {
    return items.map((item) => ({
      ...item,
      imageUrl: homeFeedThumbs[item.imageKey] ?? homeFeedThumbs[item.testId],
      lockedLabel: runtime.getUnlockLabel(runtime.state.allTests.find((test) => test.id === item.testId)!)
    }));
  }
}
