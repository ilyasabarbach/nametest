import type { HomeFeedLocale } from "@nametests/content-packs";
import { setHud } from "../components/hud";

type HomeTest = {
  id: string;
  label: string;
  subtitle: string;
  selected: boolean;
  lockedLabel?: string | null;
};

type FeedItem = {
  id: string;
  testId: string;
  imageUrl: string;
  tag: string;
  title: string;
  teaser: string;
  socialProof: string;
  hot: boolean;
  palette: [string, string];
  lockedLabel?: string | null;
};

export function showHomeOverlay(args: {
  homeLabel: string;
  heroTitle: string;
  heroBody: string;
  languageLabel: string;
  hotLabel: string;
  popularLabel: string;
  composerLabel: string;
  selectedLabel: string;
  startLabel: string;
  primaryLabel: string;
  partnerLabel: string;
  dailyLabel: string;
  eventLabel: string;
  eventTheme: string;
  streakLabel: string;
  sessionsLabel: string;
  rewardsLabel: string;
  collectionLabel: string;
  streakValue: number;
  sessionsValue: number;
  rewardValue: number;
  collectionValue: number;
  dailyRewardCoins: number;
  locales: Array<{ id: HomeFeedLocale; label: string; nativeLabel: string }>;
  currentLocale: HomeFeedLocale;
  tests: HomeTest[];
  feedItems: FeedItem[];
  feedLoadingLabel: string;
  nextUnlock: {
    title: string;
    label: string;
    remainingLabel: string;
    progressLabel: string;
    progressValue: number;
  } | null;
  onSelectTest: (testId: string) => void;
  onChangeLocale: (locale: HomeFeedLocale) => Promise<void> | void;
  onLoadMore: () => Promise<{ items: FeedItem[]; hasMore: boolean }>;
  hasMoreFeed: boolean;
  onSubmit: (selectedTestId: string, primaryName: string, partnerName: string) => void;
}): void {
  const testsById = new Map(args.tests.map((test) => [test.id, test]));
  let currentSelectedId = args.tests.find((test) => test.selected)?.id ?? args.tests[0]?.id ?? "";
  let feedItems = [...args.feedItems];
  let hasMoreFeed = args.hasMoreFeed;
  let loadingMore = false;

  const panel = document.createElement("form");
  panel.className = "hud-panel hud-panel--home-feed hud-stack";
  panel.dir = args.currentLocale === "ar" ? "rtl" : "ltr";

  const renderCards = (items: FeedItem[], extraClass = "") =>
    items
      .map((item) => {
        const selected = item.testId === currentSelectedId;
        const lockedLabel = item.lockedLabel ?? testsById.get(item.testId)?.lockedLabel;
        return `
          <button
            class="hud-feed-card ${selected ? "selected" : ""} ${lockedLabel ? "locked" : ""} ${extraClass}"
            type="button"
            data-test-id="${item.testId}"
            style="--feed-start:${item.palette[0]}; --feed-end:${item.palette[1]};"
          >
            <span class="hud-feed-card__thumb">
              <img class="hud-feed-card__image" src="${item.imageUrl}" alt="${item.title}" />
              ${item.hot ? `<span class="hud-feed-card__hot">${args.hotLabel}</span>` : ""}
              <span class="hud-feed-card__tag">${item.tag}</span>
            </span>
            <span class="hud-feed-card__body">
              <strong>${item.title}</strong>
              <small>${lockedLabel ?? item.teaser}</small>
              ${lockedLabel ? "" : `<em>${item.socialProof}</em>`}
            </span>
          </button>
        `;
      })
      .join("");

  panel.innerHTML = `
    <div class="hud-home-hero hud-stack">
      <div class="hud-home-hero__topline">
        <span class="hud-home-hero__label">${args.homeLabel}</span>
        <span class="hud-home-hero__signal">${args.dailyLabel}</span>
      </div>
      <h1>${args.heroTitle}</h1>
      <p>${args.heroBody}</p>
      <div class="hud-home-locale">
        <span class="hud-label">${args.languageLabel}</span>
        <div class="hud-home-locale__list">
          ${args.locales
            .map(
              (locale) => `
                <button
                  class="hud-locale-chip ${locale.id === args.currentLocale ? "selected" : ""}"
                  type="button"
                  data-locale-id="${locale.id}"
                  title="${locale.nativeLabel}"
                >
                  ${locale.label}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="hud-pill-row hud-pill-row-wide">
      <div class="hud-pill"><strong>${args.streakValue}</strong><span>${args.streakLabel}</span></div>
      <div class="hud-pill"><strong>${args.sessionsValue}</strong><span>${args.sessionsLabel}</span></div>
      <div class="hud-pill"><strong>${args.rewardValue}</strong><span>${args.rewardsLabel}</span></div>
      <div class="hud-pill"><strong>${args.collectionValue}</strong><span>${args.collectionLabel}</span></div>
    </div>
    ${
      args.nextUnlock
        ? `
          <div class="hud-next-unlock hud-stack">
            <div class="hud-next-unlock__header">
              <span class="hud-label">${args.nextUnlock.title}</span>
              <strong>${args.nextUnlock.label}</strong>
            </div>
            <div class="hud-next-unlock__track">
              <span class="hud-next-unlock__fill" style="width:${Math.max(8, Math.min(100, Math.round(args.nextUnlock.progressValue * 100)))}%"></span>
            </div>
            <div class="hud-next-unlock__meta">
              <span>${args.nextUnlock.remainingLabel}</span>
              <span>${args.nextUnlock.progressLabel}</span>
            </div>
          </div>
        `
        : ""
    }
    <div class="hud-home-section hud-stack">
      <div class="hud-home-section__title">
        <span class="hud-home-section__badge">${args.hotLabel}</span>
        <strong>${args.popularLabel}</strong>
      </div>
      <div class="hud-home-hot-strip" data-hot-strip>
        ${renderCards(feedItems.filter((item) => item.hot).slice(0, 4), "hud-feed-card--hot")}
      </div>
    </div>
    <div class="hud-home-section hud-stack">
      <div class="hud-home-section__title">
        <span class="hud-label">${args.eventLabel}: ${args.eventTheme}</span>
        ${args.dailyRewardCoins > 0 ? `<span class="hud-home-section__reward">+${args.dailyRewardCoins}</span>` : ""}
      </div>
      <div class="hud-discovery-feed" data-feed-grid>
        ${renderCards(feedItems)}
      </div>
      <div class="hud-feed-sentinel" data-feed-sentinel>${hasMoreFeed ? args.feedLoadingLabel : ""}</div>
    </div>
    <div class="hud-home-composer-backdrop hidden" data-composer-backdrop></div>
    <div class="hud-home-composer hud-stack hidden" data-composer-panel>
      <button class="hud-home-composer__close" type="button" data-action="close-composer" aria-label="Close">×</button>
      <div class="hud-home-composer__copy">
        <span class="hud-label">${args.composerLabel}</span>
        <strong data-selected-title>${testsById.get(currentSelectedId)?.label ?? ""}</strong>
        <p class="hud-label" data-selected-subtitle>${testsById.get(currentSelectedId)?.subtitle ?? ""}</p>
        <p class="hud-home-composer__meta">${args.selectedLabel}</p>
      </div>
      <input type="hidden" name="selectedTestId" value="${currentSelectedId}" />
      <label class="hud-stack">
        <span class="hud-label">${args.primaryLabel}</span>
        <input class="hud-input" name="primaryName" maxlength="20" autocomplete="off" />
      </label>
      <label class="hud-stack">
        <span class="hud-label">${args.partnerLabel}</span>
        <input class="hud-input" name="partnerName" maxlength="20" autocomplete="off" />
      </label>
      <button class="hud-button" type="submit">${args.startLabel}</button>
    </div>
  `;

  const selectedTitle = panel.querySelector<HTMLElement>("[data-selected-title]");
  const selectedSubtitle = panel.querySelector<HTMLElement>("[data-selected-subtitle]");
  const selectedInput = panel.querySelector<HTMLInputElement>('input[name="selectedTestId"]');
  const selectedMeta = panel.querySelector<HTMLElement>(".hud-home-composer__meta");
  const submitButton = panel.querySelector<HTMLButtonElement>('button[type="submit"]');
  const composerPanel = panel.querySelector<HTMLElement>("[data-composer-panel]");
  const composerBackdrop = panel.querySelector<HTMLElement>("[data-composer-backdrop]");
  const hotStrip = panel.querySelector<HTMLElement>("[data-hot-strip]");
  const feedGrid = panel.querySelector<HTMLElement>("[data-feed-grid]");
  const sentinel = panel.querySelector<HTMLElement>("[data-feed-sentinel]");

  const openComposer = () => {
    panel.scrollTo({ top: 0, behavior: "smooth" });
    composerPanel?.classList.remove("hidden");
    composerBackdrop?.classList.remove("hidden");
    window.setTimeout(() => {
      panel.querySelector<HTMLInputElement>('input[name="primaryName"]')?.focus();
    }, 120);
  };

  const closeComposer = () => {
    composerPanel?.classList.add("hidden");
    composerBackdrop?.classList.add("hidden");
  };

  const updateSelection = (testId: string) => {
    const nextTest = testsById.get(testId);
    if (!nextTest) {
      return;
    }

    currentSelectedId = testId;
    selectedInput?.setAttribute("value", testId);
    if (selectedInput) {
      selectedInput.value = testId;
    }
    if (selectedTitle) {
      selectedTitle.textContent = nextTest.label;
    }
    if (selectedSubtitle) {
      selectedSubtitle.textContent = nextTest.subtitle;
    }
    if (selectedMeta) {
      selectedMeta.textContent = nextTest.lockedLabel ?? args.selectedLabel;
    }
    if (submitButton) {
      submitButton.disabled = Boolean(nextTest.lockedLabel);
      submitButton.textContent = nextTest.lockedLabel ?? args.startLabel;
    }

    panel.querySelectorAll<HTMLElement>("[data-test-id]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.testId === testId);
    });
  };

  panel.querySelectorAll<HTMLButtonElement>("[data-locale-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const localeId = button.dataset.localeId as HomeFeedLocale | undefined;
      if (!localeId || localeId === args.currentLocale) {
        return;
      }

      void args.onChangeLocale(localeId);
    });
  });

  const attachCardListeners = () => {
    panel.querySelectorAll<HTMLButtonElement>("[data-test-id]").forEach((button) => {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const testId = button.dataset.testId;
        const lockedLabel = testsById.get(testId ?? "")?.lockedLabel;
        if (!testId) {
          return;
        }

        updateSelection(testId);
        openComposer();
        if (!lockedLabel) {
          args.onSelectTest(testId);
        }
      });
    });
  };

  const rerenderFeed = () => {
    if (hotStrip) {
      hotStrip.innerHTML = renderCards(feedItems.filter((item) => item.hot).slice(0, 4), "hud-feed-card--hot");
    }
    if (feedGrid) {
      feedGrid.innerHTML = renderCards(feedItems);
    }
    if (sentinel) {
      sentinel.textContent = hasMoreFeed ? args.feedLoadingLabel : "";
    }
    attachCardListeners();
  };

  attachCardListeners();

  const loadMore = async () => {
    if (!hasMoreFeed || loadingMore) {
      return;
    }
    loadingMore = true;
    const nextPage = await args.onLoadMore();
    hasMoreFeed = nextPage.hasMore;
    if (nextPage.items.length > 0) {
      feedItems = [...feedItems, ...nextPage.items];
      rerenderFeed();
    }
    loadingMore = false;
    if (sentinel && !hasMoreFeed) {
      sentinel.textContent = "";
    }
  };

  if (sentinel && hasMoreFeed && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void loadMore();
      }
    }, { root: panel, rootMargin: "240px 0px" });

    observer.observe(sentinel);
  }

  composerBackdrop?.addEventListener("click", closeComposer);
  panel.querySelector('[data-action="close-composer"]')?.addEventListener("click", closeComposer);

  panel.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(panel);
    const selectedTestId = String(form.get("selectedTestId") ?? currentSelectedId);
    const selectedTest = testsById.get(selectedTestId);
    if (selectedTest?.lockedLabel) {
      return;
    }
    closeComposer();
    args.onSubmit(selectedTestId, String(form.get("primaryName") ?? ""), String(form.get("partnerName") ?? ""));
  });

  updateSelection(currentSelectedId);
  setHud(panel);
}
