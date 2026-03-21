import {
  isArtifactRemixResponse,
  isDiscoveryFeedPagePayload,
  type ArtifactRemixRequest,
  type ArtifactRemixResponse,
  type DiscoveryFeedItemPayload,
  type RemoteConfigPayload
} from "@nametests/backend-contracts";
import {
  buildGeneratedPosterDataUrl,
  derivePastLifeEchoName,
  defaultManifest,
  defaultTests,
  enCopy,
  getFallbackDiscoveryFeedPage,
  homeFeedLocales,
  resolveCopyForLocale,
  type HomeFeedLocale
} from "@nametests/content-packs";
import {
  GameFlow,
  STORAGE_KEYS,
  TestRegistry,
  claimDailyReward,
  buildSharePayload,
  canUnlockAlternateResult,
  createPlayerProgress,
  defaultFeatureFlags,
  generateResultCard,
  getLimitedEvent,
  selectDailyFeaturedTest,
  toDateKey,
  type TestInputValue,
  type PlayerProgress,
  type SessionState,
  type TestDefinition
} from "@nametests/core";
import type { IAds, IAnalytics, IPlatform, IRemoteConfig, IShare, IStorage } from "@nametests/platform-sdk";
import { resolvePlatformServices, type PlatformServices } from "./platform/services";
import fallbackRemoteConfig from "../../../services/config/remote-config/dev.json";

type RuntimeState = {
  initialized: boolean;
  copy: Record<string, string>;
  registry: TestRegistry;
  flow: GameFlow;
  platform: IPlatform;
  ads: IAds;
  analytics: IAnalytics;
  remoteConfigService: IRemoteConfig;
  share: IShare;
  storage: IStorage;
  locale: HomeFeedLocale;
  discoveryFeedItems: DiscoveryFeedItemPayload[];
  discoveryFeedNextCursor?: string;
  remoteConfig: RemoteConfigPayload;
  progress: PlayerProgress;
  allTests: TestDefinition[];
  availableTests: TestDefinition[];
  dailyFeatured: TestDefinition;
  activeEvent: ReturnType<typeof getLimitedEvent>;
  lastDailyRewardCoins: number;
  session: SessionState;
  homeSelection: {
    selectedTestId: string;
    selectedFeedItemId: string;
  };
  homeDraftNames: {
    primaryName: string;
    partnerName: string;
  };
  resultDraftPartnerName: string;
  sceneHistory: string[];
};

type PersistedAppState = {
  session?: SessionState;
  homeSelection?: RuntimeState["homeSelection"];
  homeDraftNames?: RuntimeState["homeDraftNames"];
  resultDraftPartnerName?: string;
  sceneHistory?: string[];
};

async function loadRemoteConfig(remoteConfigService: IRemoteConfig): Promise<RemoteConfigPayload> {
  const configuredPath = import.meta.env.VITE_REMOTE_CONFIG_URL as string | undefined;
  if (configuredPath) {
    try {
      const response = await fetch(configuredPath);
      if (response.ok) {
        return (await response.json()) as RemoteConfigPayload;
      }
    } catch {
      return fallbackRemoteConfig as RemoteConfigPayload;
    }
  }

  return {
    featureFlags: await remoteConfigService.getFeatureFlags(),
    balance: await remoteConfigService.getBalanceConfig(),
    featuredTestId: fallbackRemoteConfig.featuredTestId
  };
}

async function loadStoredProgress(storage: IStorage): Promise<PlayerProgress> {
  const raw = await storage.getItem(STORAGE_KEYS.progress);
  if (!raw) {
    return createPlayerProgress();
  }

  try {
    return JSON.parse(raw) as PlayerProgress;
  } catch {
    return createPlayerProgress();
  }
}

async function loadStoredLocale(storage: IStorage): Promise<HomeFeedLocale> {
  const raw = await storage.getItem(STORAGE_KEYS.locale);
  switch (raw) {
    case "fr":
    case "es":
    case "de":
    case "ar":
    case "pt":
    case "en":
      return raw;
    default:
      return "en";
  }
}

async function loadStoredAppState(storage: IStorage): Promise<PersistedAppState | null> {
  const raw = await storage.getItem(STORAGE_KEYS.session);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
}

function createInitialState(services: PlatformServices): RuntimeState {
  const flow = new GameFlow(defaultFeatureFlags);
  const dailyFeatured = defaultTests[0];
  const today = toDateKey(new Date());

  return {
    initialized: false,
    copy: enCopy,
    registry: new TestRegistry(defaultTests),
    flow,
    platform: services.platform,
    ads: services.ads,
    analytics: services.analytics,
    remoteConfigService: services.remoteConfig,
    share: services.share,
    storage: services.storage,
    locale: "en",
    discoveryFeedItems: [],
    discoveryFeedNextCursor: undefined,
    remoteConfig: fallbackRemoteConfig as RemoteConfigPayload,
    progress: createPlayerProgress(),
    allTests: defaultTests,
    availableTests: [dailyFeatured],
    dailyFeatured,
    activeEvent: getLimitedEvent(today),
    lastDailyRewardCoins: 0,
    session: flow.createSession(dailyFeatured),
    homeSelection: {
      selectedTestId: "",
      selectedFeedItemId: ""
    },
    homeDraftNames: {
      primaryName: "",
      partnerName: ""
    },
    resultDraftPartnerName: "",
    sceneHistory: []
  };
}

async function loadDiscoveryFeedPage(locale: HomeFeedLocale, cursor?: string) {
  const configuredBase = import.meta.env.VITE_DISCOVERY_FEED_URL as string | undefined;
  if (configuredBase) {
    try {
      const url = new URL(configuredBase, window.location.href);
      url.searchParams.set("locale", locale);
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }
      const response = await fetch(url.toString());
      if (response.ok) {
        const payload = (await response.json()) as unknown;
        if (isDiscoveryFeedPagePayload(payload)) {
          return payload;
        }
      }
    } catch {
      // Fall back to the local published snapshot builder.
    }
  }

  return getFallbackDiscoveryFeedPage(locale, cursor);
}

function resolveArtifactRemixUrl(): string | null {
  const configuredPath = import.meta.env.VITE_ARTIFACT_REMIX_URL as string | undefined;
  if (configuredPath) {
    return new URL(configuredPath, window.location.href).toString();
  }

  const discoveryFeedPath = import.meta.env.VITE_DISCOVERY_FEED_URL as string | undefined;
  if (discoveryFeedPath) {
    const discoveryUrl = new URL(discoveryFeedPath, window.location.href);
    discoveryUrl.pathname = discoveryUrl.pathname.replace(/\/?(api\/)?discovery-feed$/, "/api/artifact-remix");
    discoveryUrl.search = "";
    return discoveryUrl.toString();
  }

  return null;
}

function synthesizeArtifactRemix(payload: ArtifactRemixRequest): ArtifactRemixResponse {
  const seed = `${payload.testId}|${payload.template}|${payload.names.primaryName}|${payload.names.partnerName}|${payload.result.resultKey}`;
  const scoreSeed = Array.from(seed).reduce((total, character) => total + character.charCodeAt(0), 0);
  const name = payload.names.primaryName || payload.result.title;
  const pair = payload.names.partnerName ? `${payload.names.primaryName} + ${payload.names.partnerName}` : name;
  const derivedName = derivePastLifeEchoName(name);
  const accentPalettes = {
    cosmic: ["#7c5cff", "#2bc0ff", "#ff87b5"],
    spotlight: ["#ffd166", "#72ddf7", "#ff8fab"],
    tabloid: ["#ff5d73", "#f0a202", "#6c63ff"],
    headline: ["#00a6fb", "#fb5607", "#8338ec"],
    portrait: ["#d5a6ff", "#8fd6ff", "#f3c78d"],
    storybook: ["#f0be6b", "#c98fa9", "#90b4f8"]
  } satisfies Record<ArtifactRemixRequest["template"], string[]>;
  const pickAccent = (template: ArtifactRemixRequest["template"]) =>
    accentPalettes[template][scoreSeed % accentPalettes[template].length];

  if (payload.template === "portrait") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "AI portrait glow" : "Rare portrait pull",
        title: scoreSeed % 3 === 0 ? "Velvet Portrait" : "Aura Portrait",
        body:
          scoreSeed % 2 === 0
            ? `${name} now reads like a portrait with richer light, calmer confidence, and instant screenshot energy.`
            : `${name} feels remixed into a more personal portrait artifact, with a finish that looks made for one person.`,
        insight:
          "Portrait remixes feel strongest when they stay flattering, specific, and visually collectible.",
        signature: `PORTRAIT-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the portrait version and let someone else make theirs.",
        accent: pickAccent("portrait"),
        badgeLabel: "AI portrait preview",
        posterImageDataUrl:
          payload.imageRecipeId === "past-life-vintage-poster"
            ? buildGeneratedPosterDataUrl({
                recipeId: payload.imageRecipeId,
                headline: payload.result.title,
                primaryName: name,
                derivedName,
                body: payload.result.body,
                insight: "Heart of gold",
                accent: pickAccent("portrait")
              })
            : undefined
      }
    };
  }

  if (payload.template === "storybook") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "Story remix ready" : "Legend-cover pull",
        title: scoreSeed % 3 === 0 ? "Golden Chapter Cover" : "Mythic Echo Cover",
        body:
          scoreSeed % 2 === 0
            ? `${pair} now sounds like a cover line from a story people would tap just to see the next chapter.`
            : `${pair} has been reframed into a richer story artifact, with more atmosphere and a stronger sense of mystery.`,
        insight:
          "Storybook remixes win when they feel like a cover first, and a summary second.",
        signature: `STORY-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cover version and invite someone else to open their story.",
        accent: pickAccent("storybook"),
        badgeLabel: "AI story preview",
        posterImageDataUrl:
          payload.imageRecipeId === "past-life-vintage-poster"
            ? buildGeneratedPosterDataUrl({
                recipeId: payload.imageRecipeId,
                headline: "No one is born without a past life",
                primaryName: name,
                derivedName,
                body: payload.result.body,
                insight: "Gentle side",
                accent: pickAccent("storybook")
              })
            : undefined
      }
    };
  }

  if (payload.template === "headline") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "AI headline drop" : "Future headline pull",
        title: scoreSeed % 3 === 0 ? "Main Character Headline" : "Breaking Future Headline",
        body:
          scoreSeed % 2 === 0
            ? `${name} now lands like a sharper social headline, with more status, momentum, and screenshot pull.`
            : `${name} has been reframed into a cleaner headline artifact that feels more immediate and public-facing.`,
        insight: "Headline remixes win when they feel punchy enough to post without explanation.",
        signature: `HEADLINE-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the headline version and see who wants theirs next.",
        accent: pickAccent("headline"),
        badgeLabel: "AI headline preview"
      }
    };
  }

  if (payload.template === "tabloid") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "Magazine remix ready" : "Tabloid energy pull",
        title: scoreSeed % 3 === 0 ? "Front Page Chemistry" : "Cover Story Energy",
        body:
          scoreSeed % 2 === 0
            ? `${pair} now reads like a louder magazine cover, with bigger emotion and a more share-first finish.`
            : `${pair} has been remixed into a tabloid-style artifact that feels bolder, hotter, and more attention-grabbing.`,
        insight: "Magazine remixes work best when the emotion gets bigger before the copy gets longer.",
        signature: `TABLOID-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cover-story version and let someone else make their headline.",
        accent: pickAccent("tabloid"),
        badgeLabel: "AI magazine preview"
      }
    };
  }

  if (payload.template === "spotlight") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "Badge remix ready" : "Spotlight aura pull",
        title: scoreSeed % 3 === 0 ? "Spotlight Badge" : "Rare Energy Badge",
        body:
          scoreSeed % 2 === 0
            ? `${name} now carries a cleaner badge-style identity, with brighter confidence and more social-flex energy.`
            : `${name} has been upgraded into a sharper spotlight artifact that feels more collectible and status-driven.`,
        insight: "Badge remixes win when they feel like a label people want to claim publicly.",
        signature: `SPOTLIGHT-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the badge version and invite someone else to claim theirs.",
        accent: pickAccent("spotlight"),
        badgeLabel: "AI badge preview"
      }
    };
  }

  if (payload.template === "cosmic") {
    return {
      status: "ok",
      mode: "synthetic-preview",
      template: payload.template,
      artifact: {
        hook: scoreSeed % 2 === 0 ? "AI aura surge" : "Cosmic remix ready",
        title: scoreSeed % 3 === 0 ? "Luminous Match Poster" : "Destiny Poster Remix",
        body:
          scoreSeed % 2 === 0
            ? `${pair} now feels turned into a brighter cosmic poster with more aura, more glow, and stronger share energy.`
            : `${pair} has been remixed into a richer destiny-style artifact that feels more personal and more dramatic.`,
        insight: "Cosmic remixes land best when they feel flattering, vivid, and instantly postable.",
        signature: `COSMIC-${String(scoreSeed % 1000).padStart(3, "0")}`,
        sharePrompt: "Share the cosmic version and let someone else reveal theirs.",
        accent: pickAccent("cosmic"),
        badgeLabel: "AI aura preview"
      }
    };
  }

  return {
    status: "ok",
    mode: "synthetic-preview",
    template: payload.template,
    artifact: {
      hook: payload.result.hook,
      title: `${payload.result.title} Remix`,
      body: `${payload.result.body} This upgraded version is tuned to feel more personal and more share-ready.`,
      insight: payload.result.insight,
      signature: `${payload.result.signature}-AI`,
      sharePrompt: "Share the upgraded version and invite someone else to make theirs.",
      accent: pickAccent("cosmic"),
      badgeLabel: "AI preview",
      posterImageDataUrl:
        payload.imageRecipeId === "past-life-vintage-poster"
          ? buildGeneratedPosterDataUrl({
              recipeId: payload.imageRecipeId,
              headline: "No one is born without a past life",
              primaryName: name,
              derivedName,
              body: payload.result.body,
              insight: "Hidden memory",
              accent: pickAccent("cosmic")
            })
          : undefined
    }
  };
}

function resolveFeedSelection(
  items: DiscoveryFeedItemPayload[],
  selectedTestId: string,
  preferredFeedItemId?: string
) {
  const selectedFeedItem =
    items.find((item) => item.id === preferredFeedItemId && item.testId === selectedTestId) ??
    items.find((item) => item.testId === selectedTestId) ??
    items[0];

  return {
    selectedTestId: selectedFeedItem?.testId ?? selectedTestId,
    selectedFeedItemId: selectedFeedItem?.id ?? ""
  };
}

export const runtime = {
  state: createInitialState(resolvePlatformServices()),

  configureServices(services: PlatformServices): void {
    this.state.platform = services.platform;
    this.state.ads = services.ads;
    this.state.analytics = services.analytics;
    this.state.remoteConfigService = services.remoteConfig;
    this.state.share = services.share;
    this.state.storage = services.storage;
  },

  async init(): Promise<void> {
    const [remoteConfig, progress, locale] = await Promise.all([
      loadRemoteConfig(this.state.remoteConfigService),
      loadStoredProgress(this.state.storage),
      loadStoredLocale(this.state.storage)
    ]);
    const storedAppState = await loadStoredAppState(this.state.storage);
    this.state.remoteConfig = remoteConfig;
    this.state.progress = progress;
    this.state.locale = locale;
    this.state.copy = resolveCopyForLocale(locale);
    this.state.flow.setFlags(remoteConfig.featureFlags);

    const manifest = {
      ...defaultManifest,
      featuredTestId: remoteConfig.featuredTestId
    };
    const currentDate = new Date();
    const dateKey = toDateKey(currentDate);
    const dailyReward = claimDailyReward(progress, currentDate);
    const effectiveProgress = dailyReward.progress;
    const dailyFeatured = selectDailyFeaturedTest(manifest, defaultTests, dateKey);
    const availableTests = defaultTests;
    const activeTest =
      availableTests.find((test) => test.id === dailyFeatured.id) ??
      availableTests.find((test) => test.id === remoteConfig.featuredTestId) ??
      availableTests[0] ??
      defaultTests[0];

    this.state.progress = effectiveProgress;
    this.state.dailyFeatured = dailyFeatured;
    this.state.availableTests = availableTests;
    this.state.registry = new TestRegistry(availableTests);
    this.state.activeEvent = getLimitedEvent(dateKey);
    this.state.lastDailyRewardCoins = dailyReward.rewardCoins;
    const firstFeedPage = await loadDiscoveryFeedPage(locale);
    this.state.discoveryFeedItems = firstFeedPage.items;
    this.state.discoveryFeedNextCursor = firstFeedPage.nextCursor;
    this.state.session = {
      ...this.state.flow.createSession(activeTest),
      playerProgress: effectiveProgress,
      dailyFeaturedTestId: dailyFeatured.id
    };
    this.state.homeDraftNames = {
      primaryName: this.state.session.names.primaryName,
      partnerName: this.state.session.names.partnerName
    };
    this.state.homeSelection = {
      selectedTestId: "",
      selectedFeedItemId: ""
    };
    this.state.resultDraftPartnerName = this.state.session.names.partnerName;
    this.state.sceneHistory = ["HomeScene"];

    const persistedSession = storedAppState?.session;
    const persistedTestId = persistedSession?.selectedTest?.id;
    const persistedTest =
      (persistedTestId && this.state.allTests.find((test) => test.id === persistedTestId)) ?? undefined;

    if (persistedSession && persistedTest) {
      this.state.session = {
        ...persistedSession,
        selectedTest: persistedTest,
        inputValues: persistedSession.inputValues ?? {
          primaryName: persistedSession.names.primaryName,
          partnerName: persistedSession.names.partnerName
        },
        playerProgress: effectiveProgress,
        dailyFeaturedTestId: dailyFeatured.id
      };
    }

    if (storedAppState?.homeDraftNames) {
      this.state.homeDraftNames = storedAppState.homeDraftNames;
    }

    this.state.homeSelection = {
      selectedTestId: "",
      selectedFeedItemId: ""
    };

    if (typeof storedAppState?.resultDraftPartnerName === "string") {
      this.state.resultDraftPartnerName = storedAppState.resultDraftPartnerName;
    }

    if (storedAppState?.sceneHistory?.length) {
      const relevantSceneKeys = new Set(["HomeScene", "TestScene", "ResultScene", "RewardScene"]);
      const restoredHistory = storedAppState.sceneHistory.filter((sceneKey) => relevantSceneKeys.has(sceneKey));
      this.state.sceneHistory = restoredHistory.length ? restoredHistory : ["HomeScene"];
    }

    await this.persistProgress();
    await this.persistAppState();
    this.state.initialized = true;
  },

  get manifest() {
    return defaultManifest;
  },

  get copy() {
    return this.state.copy;
  },

  get registry() {
    return this.state.registry;
  },

  get flow() {
    return this.state.flow;
  },

  get platform() {
    return this.state.platform;
  },

  get ads() {
    return this.state.ads;
  },

  get analytics() {
    return this.state.analytics;
  },

  get share() {
    return this.state.share;
  },

  get progress() {
    return this.state.progress;
  },

  get locale() {
    return this.state.locale;
  },

  getSupportedLocales() {
    return homeFeedLocales;
  },

  getDiscoveryFeedItems() {
    return this.state.discoveryFeedItems;
  },

  hasMoreDiscoveryFeed() {
    return Boolean(this.state.discoveryFeedNextCursor);
  },

  get session() {
    return this.state.session;
  },

  set session(session: SessionState) {
    this.state.session = session;
    this.state.progress = session.playerProgress;
    void this.persistProgress();
    void this.persistAppState();
  },

  getAvailableTests(): TestDefinition[] {
    return this.state.availableTests;
  },

  getHomeDraftNames() {
    return this.state.homeDraftNames;
  },

  getHomeSelection() {
    return this.state.homeSelection;
  },

  setHomeSelection(testId: string, feedItemId?: string): void {
    this.state.homeSelection = resolveFeedSelection(this.state.discoveryFeedItems, testId, feedItemId);
    void this.persistAppState();
  },

  clearHomeSelection(): void {
    this.state.homeSelection = {
      selectedTestId: "",
      selectedFeedItemId: ""
    };
    void this.persistAppState();
  },

  setHomeDraftNames(primaryName: string, partnerName: string): void {
    this.state.homeDraftNames = { primaryName, partnerName };
    void this.persistAppState();
  },

  getResultDraftPartnerName(): string {
    return this.state.resultDraftPartnerName;
  },

  setResultDraftPartnerName(partnerName: string): void {
    this.state.resultDraftPartnerName = partnerName;
    void this.persistAppState();
  },

  recordSceneVisit(sceneKey: string): void {
    const relevantSceneKeys = new Set(["HomeScene", "TestScene", "ResultScene", "RewardScene"]);
    if (!relevantSceneKeys.has(sceneKey)) {
      return;
    }

    if (this.state.sceneHistory.at(-1) === sceneKey) {
      return;
    }

    this.state.sceneHistory.push(sceneKey);
    void this.persistAppState();
  },

  resetSceneHistory(sceneKey = "HomeScene"): void {
    this.state.sceneHistory = [sceneKey];
    void this.persistAppState();
  },

  canNavigateBackScene(): boolean {
    return this.state.sceneHistory.length > 1;
  },

  popBackScene(): string | null {
    if (!this.canNavigateBackScene()) {
      return null;
    }

    this.state.sceneHistory.pop();
    void this.persistAppState();
    return this.state.sceneHistory.at(-1) ?? null;
  },

  getRestoreSceneKey(): string {
    const currentSceneKey = this.state.sceneHistory.at(-1);
    const hasPrimaryName = Boolean(this.state.session.names.primaryName.trim());
    const hasLatestResult = Boolean(this.state.session.latestResult);
    switch (currentSceneKey) {
      case "TestScene":
        if (!hasPrimaryName) {
          return "HomeScene";
        }
        return hasLatestResult ? "ResultScene" : "TestScene";
      case "ResultScene":
        return hasLatestResult ? "ResultScene" : hasPrimaryName ? "TestScene" : "HomeScene";
      case "RewardScene":
        return "ResultScene";
      default:
        return "HomeScene";
    }
  },

  getDailyFeatured(): TestDefinition {
    return this.state.dailyFeatured;
  },

  getActiveEvent() {
    return this.state.activeEvent;
  },

  getDailyRewardCoins(): number {
    return this.state.lastDailyRewardCoins;
  },

  selectTest(testId: string, feedItemId?: string, options?: { allowLocked?: boolean }): void {
    const selectionPool = this.state.allTests;
    const fallbackPool = this.state.allTests;
    const selected = selectionPool.find((test) => test.id === testId) ?? fallbackPool[0];
    if (!selected) {
      return;
    }

    this.state.session = {
      ...this.state.flow.createSession(selected),
      playerProgress: this.state.progress,
      dailyFeaturedTestId: this.state.dailyFeatured.id
    };
    this.state.homeSelection = resolveFeedSelection(this.state.discoveryFeedItems, selected.id, feedItemId);
    this.state.resultDraftPartnerName = this.state.session.names.partnerName;
    void this.persistAppState();
  },

  startSession(primaryName: string, partnerName: string, inputValues?: Record<string, TestInputValue>): void {
    this.state.homeDraftNames = { primaryName, partnerName };
    this.state.resultDraftPartnerName = partnerName;
    this.state.session = {
      ...this.state.flow.createSession(this.state.session.selectedTest, primaryName, partnerName, inputValues),
      playerProgress: this.state.progress,
      dailyFeaturedTestId: this.state.dailyFeatured.id
    };
    void this.persistAppState();
  },

  completeSession(): void {
    this.session = this.state.flow.runSession(
      this.state.session,
      {
        testId: this.state.session.selectedTest.id,
        values: this.state.session.inputValues
      },
      this.state.allTests
    );
    this.refreshAvailability();
  },

  latestCard() {
    return generateResultCard(this.state.session, this.state.copy);
  },

  latestShareText() {
    if (!this.state.session.latestResult) {
      return "";
    }

    return buildSharePayload(this.state.session.selectedTest, this.state.session.latestResult, this.state.session.names, this.state.copy);
  },

  canShowReward() {
    return this.state.session.latestResult
      ? canUnlockAlternateResult(this.state.session.latestResult, this.state.session.rewardState)
      : false;
  },

  async persistProgress(): Promise<void> {
    await this.state.storage.setItem(STORAGE_KEYS.progress, JSON.stringify(this.state.progress));
  },

  async persistAppState(): Promise<void> {
    const appState: PersistedAppState = {
      session: this.state.session,
      homeSelection: this.state.homeSelection,
      homeDraftNames: this.state.homeDraftNames,
      resultDraftPartnerName: this.state.resultDraftPartnerName,
      sceneHistory: this.state.sceneHistory
    };
    await this.state.storage.setItem(STORAGE_KEYS.session, JSON.stringify(appState));
  },

  async setLocale(locale: HomeFeedLocale): Promise<void> {
    this.state.locale = locale;
    this.state.copy = resolveCopyForLocale(locale);
    const firstFeedPage = await loadDiscoveryFeedPage(locale);
    this.state.discoveryFeedItems = firstFeedPage.items;
    this.state.discoveryFeedNextCursor = firstFeedPage.nextCursor;
    this.state.homeSelection = this.state.homeSelection.selectedTestId
      ? resolveFeedSelection(
          firstFeedPage.items,
          this.state.homeSelection.selectedTestId,
          this.state.homeSelection.selectedFeedItemId
        )
      : {
          selectedTestId: "",
          selectedFeedItemId: ""
        };
    await this.state.storage.setItem(STORAGE_KEYS.locale, locale);
    await this.persistAppState();
  },

  async loadMoreDiscoveryFeed(): Promise<DiscoveryFeedItemPayload[]> {
    if (!this.state.discoveryFeedNextCursor) {
      return [];
    }

    const nextPage = await loadDiscoveryFeedPage(this.state.locale, this.state.discoveryFeedNextCursor);
    this.state.discoveryFeedItems = [...this.state.discoveryFeedItems, ...nextPage.items];
    this.state.discoveryFeedNextCursor = nextPage.nextCursor;
    return nextPage.items;
  },

  async requestArtifactRemix(payload: ArtifactRemixRequest): Promise<ArtifactRemixResponse | null> {
    const endpoint = resolveArtifactRemixUrl();
    if (!endpoint) {
      return synthesizeArtifactRemix(payload);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return synthesizeArtifactRemix(payload);
      }

      const data = (await response.json()) as unknown;
      return isArtifactRemixResponse(data) ? data : synthesizeArtifactRemix(payload);
    } catch {
      return synthesizeArtifactRemix(payload);
    }
  },

  getUnlockLabel(test: TestDefinition): string | null {
    void test;
    return null;
  },

  getNextUnlock() {
    return null;
  },

  refreshAvailability(): void {
    this.state.availableTests = this.state.allTests;
    this.state.registry = new TestRegistry(this.state.availableTests);
  }
};
