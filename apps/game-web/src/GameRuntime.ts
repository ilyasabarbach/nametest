import {
  isArtifactRemixResponse,
  isDiscoveryFeedPagePayload,
  isTelegramInitDataVerifyResponse,
  isTelegramPrepareShareResponse,
  isTelegramStartAppResolveResponse,
  type ArtifactRemixRequest,
  type ArtifactRemixResponse,
  type DiscoveryFeedItemPayload,
  type RemoteConfigPayload,
  type TelegramMiniAppUser,
  type TelegramPrepareShareRequest,
  type TelegramPrepareShareResponse,
  type TelegramStartAppState
} from "@nametests/backend-contracts";
import {
  buildGeneratedPosterDataUrl,
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
import type {
  IAds,
  IAnalytics,
  IIdentity,
  IPlatform,
  IRemoteConfig,
  IShare,
  IStorage,
  PlatformLaunchContext,
  SocialProfile
} from "@nametests/platform-sdk";
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
  identity: IIdentity;
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
  profile: StoredProfile | null;
  resultDraftPartnerName: string;
  sceneHistory: string[];
  launchContext: PlatformLaunchContext;
  launchStartAppState: TelegramStartAppState | null;
};

type StoredProfile = SocialProfile & {
  imageDataUrl: string;
};

type ResolvedTelegramLaunch = {
  verifiedProfile: SocialProfile | null;
  startAppState: TelegramStartAppState | null;
};

type PersistedAppState = {
  session?: SessionState;
  homeSelection?: RuntimeState["homeSelection"];
  homeDraftNames?: RuntimeState["homeDraftNames"];
  resultDraftPartnerName?: string;
  sceneHistory?: string[];
};

const DEFAULT_TELEGRAM_BOT_USERNAME = "cosmikmatch_bot";
const DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME = "cosmic_match";
const TELEGRAM_LAUNCH_TEST_IDS = [
  "love-match",
  "wedding-bells",
  "friendship-score",
  "secret-crush",
  "destiny-headline",
  "past-life-echo",
  "hidden-gift",
  "aura-palette",
  "group-chat-role",
  "movie-poster"
] as const;

function resolveAvailableTestsForPlatform(allTests: TestDefinition[], platformId: string): TestDefinition[] {
  if (platformId !== "telegram") {
    return allTests;
  }

  const allowedIds = new Set<string>(TELEGRAM_LAUNCH_TEST_IDS);
  const filtered = allTests.filter((test) => allowedIds.has(test.id));
  return filtered.length ? filtered : allTests;
}

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

async function loadStoredProfile(storage: IStorage): Promise<StoredProfile | null> {
  const raw = await storage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

function toStoredProfile(profile: SocialProfile, imageDataUrl = ""): StoredProfile {
  return {
    ...profile,
    imageDataUrl
  };
}

function telegramUserToSocialProfile(user?: TelegramMiniAppUser): SocialProfile | null {
  if (!user) {
    return null;
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username || "Telegram user";

  return {
    provider: "telegram",
    id: user.id,
    displayName,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    languageCode: user.languageCode,
    imageUrl: user.photoUrl
  };
}

async function remoteImageToDataUrl(source: string, maxSize = 320): Promise<string | null> {
  try {
    const response = await fetch(source);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await blobToSizedDataUrl(blob, maxSize);
  } catch {
    return null;
  }
}

function resolveSharedApiOrigin(): string | null {
  const explicitBase = (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined)?.trim();
  if (explicitBase) {
    return new URL(explicitBase, window.location.href).origin;
  }

  const candidates = [
    import.meta.env.VITE_DISCOVERY_FEED_URL as string | undefined,
    import.meta.env.VITE_ARTIFACT_REMIX_URL as string | undefined
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate, window.location.href).origin;
    } catch {
      continue;
    }
  }

  return null;
}

function resolveBackendUrl(explicitEnvKey: string, fallbackPath: string): string | null {
  const configuredPath = (import.meta.env[explicitEnvKey] as string | undefined)?.trim();
  if (configuredPath) {
    return new URL(configuredPath, window.location.href).toString();
  }

  const sharedOrigin = resolveSharedApiOrigin();
  return sharedOrigin ? new URL(fallbackPath, sharedOrigin).toString() : null;
}

function resolveTelegramInitVerifyUrl(): string | null {
  return resolveBackendUrl("VITE_TELEGRAM_INIT_VERIFY_URL", "/api/telegram/init-verify");
}

function resolveTelegramStartAppResolveUrl(): string | null {
  return resolveBackendUrl("VITE_TELEGRAM_STARTAPP_RESOLVE_URL", "/api/telegram/startapp-resolve");
}

function resolveTelegramPrepareShareUrl(): string | null {
  return resolveBackendUrl("VITE_TELEGRAM_SHARE_URL", "/api/telegram/share-result");
}

async function blobToSizedDataUrl(blob: Blob, maxSize: number): Promise<string> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("profile_image_load_failed"));
      nextImage.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
    canvas.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      return objectUrl;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    URL.revokeObjectURL(objectUrl);
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
    identity: services.identity,
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
    profile: null,
    resultDraftPartnerName: "",
    sceneHistory: [],
    launchContext: services.platform.getLaunchContext?.() ?? {
      source: "unknown",
      platform: services.platform.id,
      isNativeShell: false
    },
    launchStartAppState: null
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
  return resolveBackendUrl("VITE_ARTIFACT_REMIX_URL", "/api/artifact-remix");
}

function synthesizeArtifactRemix(payload: ArtifactRemixRequest): ArtifactRemixResponse {
  const seed = `${payload.testId}|${payload.template}|${payload.names.primaryName}|${payload.names.partnerName}|${payload.result.resultKey}`;
  const scoreSeed = Array.from(seed).reduce((total, character) => total + character.charCodeAt(0), 0);
  const name = payload.names.primaryName || payload.result.title;
  const pair = payload.names.partnerName ? `${payload.names.primaryName} + ${payload.names.partnerName}` : name;
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
                primaryName: name,
                resultKey: payload.result.resultKey,
                resultTitle: payload.result.title,
              body: payload.result.body,
              insight: payload.result.insight,
                accent: pickAccent("portrait"),
                presentPortraitImageDataUrl: payload.presentPhotoDataUrl
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
                primaryName: name,
                resultKey: payload.result.resultKey,
                resultTitle: payload.result.title,
                body: payload.result.body,
                insight: payload.result.insight,
                accent: pickAccent("storybook"),
                presentPortraitImageDataUrl: payload.presentPhotoDataUrl
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
              primaryName: name,
              resultKey: payload.result.resultKey,
              resultTitle: payload.result.title,
              body: payload.result.body,
              insight: payload.result.insight,
              accent: pickAccent("cosmic"),
              presentPortraitImageDataUrl: payload.presentPhotoDataUrl
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

function decodeLocalStartAppState(token: string): TelegramStartAppState | null {
  const [encodedPayload] = token.split(".", 1);
  try {
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    const payload = JSON.parse(atob(padded)) as TelegramStartAppState;
    if (payload?.version !== 1 || typeof payload.testId !== "string") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function normalizeBotUsername(raw: string | undefined): string | null {
  const normalized = raw?.trim().replace(/^@+/, "");
  return normalized ? normalized : null;
}

async function resolveTelegramLaunchContext(launchContext: PlatformLaunchContext): Promise<ResolvedTelegramLaunch> {
  const fallback: ResolvedTelegramLaunch = {
    verifiedProfile: null,
    startAppState: null
  };

  if (!launchContext.initDataRaw && !launchContext.startParam) {
    return fallback;
  }

  let verifiedProfile: SocialProfile | null = null;
  const initVerifyUrl = resolveTelegramInitVerifyUrl();
  if (launchContext.initDataRaw && initVerifyUrl) {
    try {
      const response = await fetch(initVerifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ initDataRaw: launchContext.initDataRaw })
      });
      if (response.ok) {
        const payload = (await response.json()) as unknown;
        if (isTelegramInitDataVerifyResponse(payload)) {
          verifiedProfile = telegramUserToSocialProfile(payload.user);
          if (!launchContext.startParam && payload.startParam) {
            launchContext.startParam = payload.startParam;
          }
        }
      }
    } catch {
      verifiedProfile = null;
    }
  }

  let startAppState: TelegramStartAppState | null = null;
  if (launchContext.startParam) {
    const startAppUrl = resolveTelegramStartAppResolveUrl();
    if (startAppUrl) {
      try {
        const resolveUrl = new URL(startAppUrl);
        resolveUrl.searchParams.set("startapp", launchContext.startParam);
        const response = await fetch(resolveUrl.toString());
        if (response.ok) {
          const payload = (await response.json()) as unknown;
          if (isTelegramStartAppResolveResponse(payload) && payload.status === "ok") {
            startAppState = payload.state ?? null;
          }
        }
      } catch {
        startAppState = null;
      }
    }

    if (!startAppState) {
      startAppState = decodeLocalStartAppState(launchContext.startParam);
    }
  }

  return {
    verifiedProfile,
    startAppState
  };
}

export const runtime = {
  state: createInitialState(resolvePlatformServices()),

  syncPlatformChrome(): void {
    this.state.platform.updateNavigationChrome?.({
      showBack: this.canNavigateBackScene(),
      showSettings: true
    });
    this.state.platform.setClosingConfirmation?.(this.canNavigateBackScene());
  },

  configureServices(services: PlatformServices): void {
    this.state.platform = services.platform;
    this.state.ads = services.ads;
    this.state.analytics = services.analytics;
    this.state.identity = services.identity;
    this.state.remoteConfigService = services.remoteConfig;
    this.state.share = services.share;
    this.state.storage = services.storage;
    this.state.launchContext = services.platform.getLaunchContext?.() ?? {
      source: "unknown",
      platform: services.platform.id,
      isNativeShell: false
    };
  },

  async init(): Promise<void> {
    this.state.launchContext = this.state.platform.getLaunchContext?.() ?? {
      source: "unknown",
      platform: this.state.platform.id,
      isNativeShell: false
    };

    const [remoteConfig, progress, locale, profile, platformProfile, resolvedTelegramLaunch] = await Promise.all([
      loadRemoteConfig(this.state.remoteConfigService),
      loadStoredProgress(this.state.storage),
      loadStoredLocale(this.state.storage),
      loadStoredProfile(this.state.storage),
      this.state.identity.getPlatformProfile(),
      this.state.platform.id === "telegram"
        ? resolveTelegramLaunchContext({ ...this.state.launchContext })
        : Promise.resolve<ResolvedTelegramLaunch>({
            verifiedProfile: null,
            startAppState: null
          })
    ]);
    const storedAppState = await loadStoredAppState(this.state.storage);
    this.state.remoteConfig = remoteConfig;
    this.state.progress = progress;
    this.state.locale = locale;
    this.state.copy = resolveCopyForLocale(locale);
    this.state.profile = profile;
    this.state.launchStartAppState = resolvedTelegramLaunch.startAppState;
    this.state.flow.setFlags(remoteConfig.featureFlags);

    const effectivePlatformProfile = resolvedTelegramLaunch.verifiedProfile ?? platformProfile ?? profile;
    if (
      effectivePlatformProfile &&
      (!this.state.profile ||
        this.state.profile.id !== effectivePlatformProfile.id ||
        this.state.profile.provider !== effectivePlatformProfile.provider)
    ) {
      const imageDataUrl = effectivePlatformProfile.imageUrl
        ? (await remoteImageToDataUrl(effectivePlatformProfile.imageUrl)) ?? ""
        : "";
      this.state.profile = toStoredProfile(effectivePlatformProfile, imageDataUrl);
      await this.state.storage.setItem(STORAGE_KEYS.profile, JSON.stringify(this.state.profile));
    } else if (this.state.profile?.imageUrl && !this.state.profile.imageDataUrl) {
      const imageDataUrl = await remoteImageToDataUrl(this.state.profile.imageUrl);
      if (imageDataUrl) {
        this.state.profile = {
          ...this.state.profile,
          imageDataUrl
        };
        await this.state.storage.setItem(STORAGE_KEYS.profile, JSON.stringify(this.state.profile));
      }
    }

    const manifest = {
      ...defaultManifest,
      featuredTestId: remoteConfig.featuredTestId
    };
    const currentDate = new Date();
    const dateKey = toDateKey(currentDate);
    const dailyReward = claimDailyReward(progress, currentDate);
    const effectiveProgress = dailyReward.progress;
    const dailyFeatured = selectDailyFeaturedTest(manifest, defaultTests, dateKey);
    const availableTests = resolveAvailableTestsForPlatform(defaultTests, this.state.platform.id);
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

    if (this.state.launchStartAppState) {
      const launchTest =
        this.state.allTests.find((test) => test.id === this.state.launchStartAppState?.testId) ?? this.state.session.selectedTest;
      this.state.session = {
        ...this.state.flow.createSession(launchTest),
        playerProgress: effectiveProgress,
        dailyFeaturedTestId: dailyFeatured.id
      };
      this.state.homeSelection = resolveFeedSelection(
        this.state.discoveryFeedItems,
        launchTest.id,
        this.state.launchStartAppState.feedItemId
      );
      this.state.homeDraftNames = {
        primaryName: "",
        partnerName: ""
      };
      this.state.resultDraftPartnerName = "";
      this.state.sceneHistory = ["HomeScene"];
    }

    await this.persistProgress();
    await this.persistAppState();
    this.analytics.track({
      name: "launch_resolved",
      payload: {
        platform: this.state.platform.id,
        source: this.state.launchContext.source,
        startParam: this.state.launchContext.startParam,
        testId: this.state.launchStartAppState?.testId
      }
    });
    this.syncPlatformChrome();
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

  get identity() {
    return this.state.identity;
  },

  get share() {
    return this.state.share;
  },

  get progress() {
    return this.state.progress;
  },

  get profile() {
    return this.state.profile;
  },

  getLaunchContext() {
    return this.state.launchContext;
  },

  canUsePlatformProfilePhoto(): boolean {
    return Boolean(this.state.profile?.imageUrl || this.state.identity.canUseGoogleProfile());
  },

  canUseGoogleProfilePhoto(): boolean {
    return this.canUsePlatformProfilePhoto();
  },

  getProfilePhotoActionLabel(): string {
    if (this.state.platform.id === "telegram") {
      return this.state.copy["result.telegramPhotoLabel"] ?? "Use Telegram photo";
    }

    return this.state.copy["result.googlePhotoLabel"] ?? this.state.copy["result.profilePhotoLabel"] ?? "Use profile photo";
  },

  getActiveProfilePhotoDataUrl(): string | undefined {
    return this.state.profile?.imageDataUrl || undefined;
  },

  async connectPlatformProfilePhoto(): Promise<StoredProfile | null> {
    if (this.state.profile?.imageDataUrl) {
      return this.state.profile;
    }

    const platformProfile = this.state.profile ?? (await this.state.identity.getPlatformProfile());
    if (platformProfile?.imageUrl) {
      const imageDataUrl = await remoteImageToDataUrl(platformProfile.imageUrl);
      if (imageDataUrl) {
        this.state.profile = toStoredProfile(platformProfile, imageDataUrl);
        await this.state.storage.setItem(STORAGE_KEYS.profile, JSON.stringify(this.state.profile));
        return this.state.profile;
      }
    }

    const connectedProfile = await this.state.identity.connectGoogleProfile();
    if (!connectedProfile?.imageUrl) {
      return null;
    }

    const imageDataUrl = await remoteImageToDataUrl(connectedProfile.imageUrl);
    if (!imageDataUrl) {
      return null;
    }

    this.state.profile = {
      ...connectedProfile,
      imageDataUrl
    };
    await this.state.storage.setItem(STORAGE_KEYS.profile, JSON.stringify(this.state.profile));
    return this.state.profile;
  },

  async connectGoogleProfilePhoto(): Promise<StoredProfile | null> {
    return this.connectPlatformProfilePhoto();
  },

  async clearGoogleProfilePhoto(): Promise<void> {
    this.state.profile = null;
    await this.state.storage.setItem(STORAGE_KEYS.profile, "");
    await this.state.identity.disconnectGoogleProfile();
  },

  buildResultPosterImage(params: { title: string; body: string; insight: string; accent: string }): string | undefined {
    const imageRecipeId = this.state.session.selectedTest.imageRecipeId;
    if (!imageRecipeId) {
      return undefined;
    }

    return buildGeneratedPosterDataUrl({
      recipeId: imageRecipeId,
      primaryName: this.state.session.names.primaryName || params.title,
      resultKey: this.state.session.latestResult?.resultKey ?? "default",
      resultTitle: params.title,
      body: params.body,
      insight: params.insight,
      accent: params.accent,
      presentPortraitImageDataUrl: this.state.profile?.imageDataUrl
    });
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
    this.syncPlatformChrome();
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
    this.syncPlatformChrome();
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
    this.syncPlatformChrome();
  },

  resetSceneHistory(sceneKey = "HomeScene"): void {
    this.state.sceneHistory = [sceneKey];
    void this.persistAppState();
    this.syncPlatformChrome();
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
    this.syncPlatformChrome();
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
    this.syncPlatformChrome();
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

  canShareToStory(): boolean {
    return (
      this.state.platform.id === "telegram" &&
      Boolean(this.state.share.canShareToStory?.()) &&
      Boolean((import.meta.env.VITE_TELEGRAM_PUBLIC_BASE_URL as string | undefined)?.trim())
    );
  },

  privateBuildTelegramStartState(template?: ArtifactRemixRequest["template"]): TelegramStartAppState {
    return {
      version: 1,
      testId: this.state.session.selectedTest.id,
      feedItemId: this.state.homeSelection.selectedFeedItemId || undefined,
      template,
      resultKey: this.state.session.latestResult?.resultKey
    };
  },

  privateBuildLocalTelegramShare(payload: {
    text: string;
    title?: string;
    imageDataUrl?: string;
    filename?: string;
    template?: ArtifactRemixRequest["template"];
  }): TelegramPrepareShareResponse | null {
    if (this.state.platform.id !== "telegram") {
      return null;
    }

    const botUsername =
      normalizeBotUsername(import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined) ??
      DEFAULT_TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return null;
    }

    const state = this.privateBuildTelegramStartState(payload.template);
    const encodedState = btoa(JSON.stringify(state))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const miniAppShortName =
      (import.meta.env.VITE_TELEGRAM_MINI_APP_SHORT_NAME as string | undefined)?.trim() ||
      DEFAULT_TELEGRAM_MINI_APP_SHORT_NAME;
    const basePath = miniAppShortName ? `/${botUsername}/${miniAppShortName}` : `/${botUsername}`;
    const deepLinkUrl = `https://t.me${basePath}?startapp=${encodedState}`;
    const shareUrl = new URL("https://t.me/share/url");
    shareUrl.searchParams.set("url", deepLinkUrl);
    shareUrl.searchParams.set("text", payload.text);

    return {
      status: "ok",
      deepLinkUrl,
      shareUrl: shareUrl.toString(),
      shareText: payload.text,
      storyWidgetLinkUrl: deepLinkUrl,
      storyWidgetLinkName: this.state.copy["result.makeYours"] ?? "Make yours"
    };
  },

  async prepareTelegramShare(payload: {
    text: string;
    title?: string;
    imageDataUrl?: string;
    filename?: string;
    template?: ArtifactRemixRequest["template"];
  }): Promise<TelegramPrepareShareResponse | null> {
    if (this.state.platform.id !== "telegram") {
      return null;
    }

    const request: TelegramPrepareShareRequest = {
      text: payload.text,
      title: payload.title,
      imageDataUrl: payload.imageDataUrl,
      filename: payload.filename,
      state: this.privateBuildTelegramStartState(payload.template)
    };

    const endpoint = resolveTelegramPrepareShareUrl();
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(request)
        });
        if (response.ok) {
          const data = (await response.json()) as unknown;
          if (isTelegramPrepareShareResponse(data)) {
            return data;
          }
        }
      } catch {
        // Fall back to local deeplink generation below.
      }
    }

    return this.privateBuildLocalTelegramShare(payload);
  },

  async shareResultArtifact(payload: {
    title: string;
    text: string;
    imageDataUrl?: string;
    filename?: string;
    template?: ArtifactRemixRequest["template"];
  }): Promise<void> {
    if (this.state.platform.id === "telegram") {
      const localTelegramShare = this.privateBuildLocalTelegramShare(payload);
      await this.state.share.share({
        title: payload.title,
        text: localTelegramShare?.shareText ?? payload.text,
        linkUrl: localTelegramShare?.deepLinkUrl,
        telegramShareUrl: localTelegramShare?.shareUrl,
        telegramMessageId: localTelegramShare?.messageId
      });
      return;
    }

    const telegramShare = await this.prepareTelegramShare(payload);
    await this.state.share.share({
      title: payload.title,
      text: telegramShare?.shareText ?? payload.text,
      imageDataUrl: payload.imageDataUrl,
      filename: payload.filename,
      linkUrl: telegramShare?.deepLinkUrl,
      telegramShareUrl: telegramShare?.shareUrl,
      telegramMessageId: telegramShare?.messageId
    });
  },

  async shareResultStoryArtifact(payload: {
    title: string;
    text: string;
    imageDataUrl?: string;
    filename?: string;
    template?: ArtifactRemixRequest["template"];
  }): Promise<boolean> {
    if (!this.canShareToStory() || !this.state.share.shareToStory) {
      return false;
    }

    const telegramShare = await this.prepareTelegramShare(payload);
    if (!telegramShare?.storyMediaUrl) {
      return false;
    }

    await this.state.share.shareToStory({
      title: payload.title,
      text: telegramShare.shareText,
      imageDataUrl: payload.imageDataUrl,
      filename: payload.filename,
      linkUrl: telegramShare.deepLinkUrl,
      storyMediaUrl: telegramShare.storyMediaUrl,
      storyWidgetLinkUrl: telegramShare.storyWidgetLinkUrl,
      storyWidgetLinkName: telegramShare.storyWidgetLinkName,
      storyText: `${payload.title ?? this.state.session.selectedTest.id} · ${this.state.copy["result.makeYours"] ?? "Make yours"}`
    });
    return true;
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
    this.state.availableTests = resolveAvailableTestsForPlatform(this.state.allTests, this.state.platform.id);
    this.state.registry = new TestRegistry(this.state.availableTests);
  }
};
