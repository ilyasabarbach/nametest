import { isDiscoveryFeedPagePayload, type DiscoveryFeedItemPayload, type RemoteConfigPayload } from "@nametests/backend-contracts";
import {
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
  getNextUnlockTarget,
  getUnlockedTests,
  selectDailyFeaturedTest,
  toDateKey,
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
    session: flow.createSession(dailyFeatured)
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
    const availableTests = getUnlockedTests(defaultTests, effectiveProgress, remoteConfig.featureFlags.hiddenTestsEnabled);
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
    await this.persistProgress();
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
  },

  getAvailableTests(): TestDefinition[] {
    return this.state.availableTests;
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

  selectTest(testId: string): void {
    const selected = this.state.availableTests.find((test) => test.id === testId) ?? this.state.availableTests[0];
    if (!selected) {
      return;
    }

    this.state.session = {
      ...this.state.flow.createSession(selected),
      playerProgress: this.state.progress,
      dailyFeaturedTestId: this.state.dailyFeatured.id
    };
  },

  startSession(primaryName: string, partnerName: string): void {
    this.state.session = {
      ...this.state.flow.createSession(this.state.session.selectedTest, primaryName, partnerName),
      playerProgress: this.state.progress,
      dailyFeaturedTestId: this.state.dailyFeatured.id
    };
  },

  completeSession(): void {
    this.session = this.state.flow.runSession(
      this.state.session,
      {
        testId: this.state.session.selectedTest.id,
        values: this.state.session.names
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

  async setLocale(locale: HomeFeedLocale): Promise<void> {
    this.state.locale = locale;
    this.state.copy = resolveCopyForLocale(locale);
    const firstFeedPage = await loadDiscoveryFeedPage(locale);
    this.state.discoveryFeedItems = firstFeedPage.items;
    this.state.discoveryFeedNextCursor = firstFeedPage.nextCursor;
    await this.state.storage.setItem(STORAGE_KEYS.locale, locale);
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

  getUnlockLabel(test: TestDefinition): string | null {
    if (this.state.availableTests.some((entry) => entry.id === test.id)) {
      return null;
    }

    const unlockAt = test.unlockAfterSessions ?? 0;
    return this.state.copy["home.unlock"].replace("{count}", String(unlockAt));
  },

  getNextUnlock() {
    const target = getNextUnlockTarget(
      this.state.allTests,
      this.state.progress,
      this.state.remoteConfig.featureFlags.hiddenTestsEnabled
    );

    if (!target) {
      return null;
    }

    const test = this.state.allTests.find((entry) => entry.id === target.testId);
    if (!test) {
      return null;
    }

    return {
      id: target.testId,
      label: this.state.copy[test.titleKey] ?? target.testId,
      unlockAtSessions: target.unlockAtSessions,
      sessionsRemaining: target.sessionsRemaining,
      sessionsPlayedTowardUnlock: Math.min(this.state.progress.sessionsPlayed, target.unlockAtSessions)
    };
  },

  refreshAvailability(): void {
    this.state.availableTests = getUnlockedTests(
      this.state.allTests,
      this.state.progress,
      this.state.remoteConfig.featureFlags.hiddenTestsEnabled
    );
    this.state.registry = new TestRegistry(this.state.availableTests);
  }
};
