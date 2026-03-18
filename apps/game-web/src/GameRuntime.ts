import type { RemoteConfigPayload } from "@nametests/backend-contracts/remoteConfig.schema";
import { defaultManifest, defaultTests, enCopy } from "@nametests/content-packs";
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
  getUnlockedTests,
  selectDailyFeaturedTest,
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

function createInitialState(services: PlatformServices): RuntimeState {
  const flow = new GameFlow(defaultFeatureFlags);
  const dailyFeatured = defaultTests[0];

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
    remoteConfig: fallbackRemoteConfig as RemoteConfigPayload,
    progress: createPlayerProgress(),
    allTests: defaultTests,
    availableTests: [dailyFeatured],
    dailyFeatured,
    activeEvent: getLimitedEvent(new Date().toISOString().slice(0, 10)),
    lastDailyRewardCoins: 0,
    session: flow.createSession(dailyFeatured)
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
    const [remoteConfig, progress] = await Promise.all([
      loadRemoteConfig(this.state.remoteConfigService),
      loadStoredProgress(this.state.storage)
    ]);
    this.state.remoteConfig = remoteConfig;
    this.state.progress = progress;
    this.state.flow.setFlags(remoteConfig.featureFlags);

    const manifest = {
      ...defaultManifest,
      featuredTestId: remoteConfig.featuredTestId
    };
    const dateKey = new Date().toISOString().slice(0, 10);
    const dailyReward = claimDailyReward(progress, new Date());
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

    return buildSharePayload(this.state.session.selectedTest, this.state.session.latestResult, this.state.session.names);
  },

  canShowReward() {
    return this.state.session.latestResult
      ? canUnlockAlternateResult(this.state.session.latestResult, this.state.session.rewardState)
      : false;
  },

  async persistProgress(): Promise<void> {
    await this.state.storage.setItem(STORAGE_KEYS.progress, JSON.stringify(this.state.progress));
  },

  getUnlockLabel(test: TestDefinition): string | null {
    if (this.state.availableTests.some((entry) => entry.id === test.id)) {
      return null;
    }

    const unlockAt = test.unlockAfterSessions ?? 0;
    return this.state.copy["home.unlock"].replace("{count}", String(unlockAt));
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
