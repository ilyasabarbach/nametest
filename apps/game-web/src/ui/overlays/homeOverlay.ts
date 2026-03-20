import type { HomeFeedLocale } from "@nametests/content-packs";
import { setHud } from "../components/hud";

type HomeTest = {
  id: string;
  label: string;
  subtitle: string;
  selected: boolean;
  lockedLabel?: string | null;
  primaryPromptLabel: string;
  primaryPromptPlaceholder: string;
  partnerPromptLabel?: string;
  partnerPromptPlaceholder?: string;
  requiresPartner: boolean;
  interactionMode: "form" | "tap";
  tapLabel: string;
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
  socialBrandLabel: string;
  socialSectionLabel: string;
  socialStatusLabel: string;
  socialMetaLabel: string;
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
  privacyLabel: string;
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
  initialSelectedFeedItemId?: string;
  nextUnlock: {
    title: string;
    label: string;
    remainingLabel: string;
    progressLabel: string;
    progressValue: number;
  } | null;
  onSelectTest: (testId: string, feedItemId?: string) => void;
  onChangeLocale: (locale: HomeFeedLocale) => Promise<void> | void;
  onLoadMore: () => Promise<{ items: FeedItem[]; hasMore: boolean }>;
  hasMoreFeed: boolean;
  defaultPrimaryName: string;
  defaultPartnerName: string;
  onDraftChange: (primaryName: string, partnerName: string) => void;
  onSubmit: (selectedTestId: string, selectedFeedItemId: string, primaryName: string, partnerName: string) => void;
}): void {
  const testsById = new Map(args.tests.map((test) => [test.id, test]));
  let currentSelectedId = args.tests.find((test) => test.selected)?.id ?? "";
  let currentSelectedFeedItemId =
    args.feedItems.find((item) => item.id === args.initialSelectedFeedItemId && item.testId === currentSelectedId)?.id ??
    args.feedItems.find((item) => item.testId === currentSelectedId)?.id ??
    "";
  let feedItems = [...args.feedItems];
  let hasMoreFeed = args.hasMoreFeed;
  let loadingMore = false;

  const panel = document.createElement("form");
  panel.className = "hud-panel hud-panel--home-feed hud-stack";
  panel.dir = args.currentLocale === "ar" ? "rtl" : "ltr";

  const hasSelection = () => Boolean(currentSelectedId);

  const getSelectedFeedItem = () =>
    hasSelection()
      ? (feedItems.find((item) => item.id === currentSelectedFeedItemId) ??
        feedItems.find((item) => item.testId === currentSelectedId))
      : undefined;

  const selectedFeedItem = getSelectedFeedItem();
  const getSelectedTest = () => testsById.get(currentSelectedId);
  const isTouchSelection = () => getSelectedTest()?.interactionMode === "tap";

  const getCardTemplate = (item: FeedItem, index: number, lane: "hot" | "feed") => {
    if (lane === "hot") {
      return index === 0 ? "lead" : index % 2 === 0 ? "compact" : "stacked";
    }

    if (item.hot && index % 4 === 0) {
      return "wide";
    }

    return index % 3 === 1 ? "compact" : "stacked";
  };

  const getCardFamily = (item: FeedItem, lane: "hot" | "feed") => {
    if (item.testId === "past-life-echo" || item.testId === "star-aura") {
      return "portrait";
    }

    if (item.testId === "destiny-headline" || item.testId === "fame-level") {
      return "tabloid";
    }

    if (item.testId === "future-career" || item.testId === "wedding-bells") {
      return "calendar";
    }

    if (item.testId === "friendship-score" || item.testId === "hidden-gift") {
      return "touch";
    }

    return lane === "hot" ? "feature" : "story";
  };

  const renderCards = (items: FeedItem[], lane: "hot" | "feed", extraClass = "") =>
    items
      .map((item, index) => {
        const selected = item.id === currentSelectedFeedItemId;
        const lockedLabel = item.lockedLabel ?? testsById.get(item.testId)?.lockedLabel;
        const template = getCardTemplate(item, index, lane);
        const family = getCardFamily(item, lane);
        return `
          <button
            class="hud-feed-card hud-feed-card--${template} hud-feed-card--family-${family} ${selected ? "selected" : ""} ${lockedLabel ? "locked" : ""} ${extraClass}"
            type="button"
            data-test-id="${item.testId}"
            data-feed-item-id="${item.id}"
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
    <div class="hud-social-chrome hud-social-chrome--home">
      <div class="hud-social-chrome__brand">
        <strong>${args.socialBrandLabel}</strong>
        <span>${args.socialSectionLabel}</span>
      </div>
      <div class="hud-social-chrome__meta">
        <span class="hud-social-chrome__pill">${args.socialStatusLabel}</span>
        <span class="hud-social-chrome__text">${args.socialMetaLabel}</span>
        <button class="hud-settings-button" type="button" data-action="toggle-settings" title="${args.languageLabel}" aria-label="${args.languageLabel}">
          &#9881;
        </button>
        <div class="hud-settings-menu hidden" data-settings-menu>
          <strong>${args.languageLabel}</strong>
          <div class="hud-settings-menu__list">
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
    </div>
    <div class="hud-landing-story hud-stack ${hasSelection() ? "" : "hidden"}" data-landing-story>
      <div class="hud-landing-story__copy">
        <h2 data-selected-headline>${selectedFeedItem?.title ?? testsById.get(currentSelectedId)?.label ?? ""}</h2>
        <p class="hud-label" data-selected-teaser>${selectedFeedItem?.teaser ?? testsById.get(currentSelectedId)?.subtitle ?? ""}</p>
      </div>
      <div class="hud-home-composer hud-stack ${isTouchSelection() ? "hidden" : ""}" data-home-composer>
        <div class="hud-home-composer__copy">
          <strong data-selected-title>${testsById.get(currentSelectedId)?.label ?? ""}</strong>
          <p class="hud-label" data-selected-subtitle>${testsById.get(currentSelectedId)?.subtitle ?? ""}</p>
        </div>
        <input type="hidden" name="selectedTestId" value="${currentSelectedId}" />
        <label class="hud-stack hud-home-composer__field">
          <span class="hud-label hud-home-composer__field-label" data-primary-label>${testsById.get(currentSelectedId)?.primaryPromptLabel ?? args.primaryLabel}</span>
          <input
            class="hud-input"
            name="primaryName"
            maxlength="20"
            autocomplete="off"
            value="${args.defaultPrimaryName}"
            placeholder="${testsById.get(currentSelectedId)?.primaryPromptPlaceholder ?? ""}"
          />
        </label>
        <label class="hud-stack hud-home-composer__field ${testsById.get(currentSelectedId)?.requiresPartner ? "" : "hidden"}" data-partner-field>
          <span class="hud-label hud-home-composer__field-label" data-partner-label>${testsById.get(currentSelectedId)?.partnerPromptLabel ?? args.partnerLabel}</span>
          <input
            class="hud-input"
            name="partnerName"
            maxlength="20"
            autocomplete="off"
            value="${args.defaultPartnerName}"
            placeholder="${testsById.get(currentSelectedId)?.partnerPromptPlaceholder ?? ""}"
          />
        </label>
        <button class="hud-button hud-button--editorial" type="submit">${args.startLabel}</button>
        <p class="hud-home-privacy">${args.privacyLabel}</p>
      </div>
      <button class="hud-landing-story__tap hud-landing-story__tap--standalone ${isTouchSelection() ? "" : "hidden"}" type="button" data-action="tap-photo">
        ${getSelectedTest()?.tapLabel ?? ""}
      </button>
    </div>
    <div class="hud-home-section hud-stack">
      <div class="hud-home-section__title">
        <span class="hud-home-section__badge">${args.hotLabel}</span>
        <strong>${args.popularLabel}</strong>
      </div>
      <div class="hud-home-hot-strip" data-hot-strip>
        ${renderCards(feedItems.filter((item) => item.hot).slice(0, 4), "hot", "hud-feed-card--hot")}
      </div>
    </div>
    <div class="hud-home-section hud-stack">
      <div class="hud-home-section__title">
        <span class="hud-label">${args.eventLabel}: ${args.eventTheme}</span>
        ${args.dailyRewardCoins > 0 ? `<span class="hud-home-section__reward">+${args.dailyRewardCoins}</span>` : ""}
      </div>
      <div class="hud-discovery-feed" data-feed-grid>
        ${renderCards(feedItems, "feed")}
      </div>
      <div class="hud-feed-sentinel" data-feed-sentinel>${hasMoreFeed ? args.feedLoadingLabel : ""}</div>
    </div>
    <div class="hud-home-footnote hud-stack">
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
      <div class="hud-pill-row hud-pill-row-wide hud-home-stats">
        <div class="hud-pill"><strong>${args.streakValue}</strong><span>${args.streakLabel}</span></div>
        <div class="hud-pill"><strong>${args.sessionsValue}</strong><span>${args.sessionsLabel}</span></div>
        <div class="hud-pill"><strong>${args.rewardValue}</strong><span>${args.rewardsLabel}</span></div>
        <div class="hud-pill"><strong>${args.collectionValue}</strong><span>${args.collectionLabel}</span></div>
      </div>
    </div>
  `;

  const selectedTitle = panel.querySelector<HTMLElement>("[data-selected-title]");
  const selectedSubtitle = panel.querySelector<HTMLElement>("[data-selected-subtitle]");
  const selectedHeadline = panel.querySelector<HTMLElement>("[data-selected-headline]");
  const selectedTeaser = panel.querySelector<HTMLElement>("[data-selected-teaser]");
  const selectedInput = panel.querySelector<HTMLInputElement>('input[name="selectedTestId"]');
  const submitButton = panel.querySelector<HTMLButtonElement>('button[type="submit"]');
  const primaryInput = panel.querySelector<HTMLInputElement>('input[name="primaryName"]');
  const partnerInput = panel.querySelector<HTMLInputElement>('input[name="partnerName"]');
  const primaryLabel = panel.querySelector<HTMLElement>("[data-primary-label]");
  const partnerField = panel.querySelector<HTMLElement>("[data-partner-field]");
  const partnerLabel = panel.querySelector<HTMLElement>("[data-partner-label]");
  const hotStrip = panel.querySelector<HTMLElement>("[data-hot-strip]");
  const feedGrid = panel.querySelector<HTMLElement>("[data-feed-grid]");
  const sentinel = panel.querySelector<HTMLElement>("[data-feed-sentinel]");
  const landingStory = panel.querySelector<HTMLElement>("[data-landing-story]");
  const composer = panel.querySelector<HTMLElement>("[data-home-composer]");
  const settingsMenu = panel.querySelector<HTMLElement>("[data-settings-menu]");
  const tapPhotoButton = panel.querySelector<HTMLButtonElement>('[data-action="tap-photo"]');

  const syncDraft = () => {
    args.onDraftChange(primaryInput?.value ?? "", partnerInput?.value ?? "");
  };

  const syncLandingVisibility = () => {
    landingStory?.classList.toggle("hidden", !hasSelection());
  };

  const submitCurrentSelection = () => {
    if (!currentSelectedId) {
      return;
    }

    if (testsById.get(currentSelectedId)?.lockedLabel) {
      return;
    }

    syncDraft();
    args.onSubmit(currentSelectedId, currentSelectedFeedItemId, primaryInput?.value ?? "", partnerInput?.value ?? "");
  };

  const updateSelection = (testId: string, feedItemId?: string) => {
    const nextTest = testsById.get(testId);
    if (!nextTest) {
      return;
    }

    currentSelectedId = testId;
    currentSelectedFeedItemId =
      feedItems.find((item) => item.id === feedItemId && item.testId === testId)?.id ??
      feedItems.find((item) => item.testId === testId)?.id ??
      currentSelectedFeedItemId;
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
    if (primaryLabel) {
      primaryLabel.textContent = nextTest.primaryPromptLabel;
    }
    if (primaryInput) {
      primaryInput.placeholder = nextTest.primaryPromptPlaceholder;
    }
    if (partnerField) {
      partnerField.classList.toggle("hidden", !nextTest.requiresPartner);
    }
    if (partnerLabel) {
      partnerLabel.textContent = nextTest.partnerPromptLabel ?? args.partnerLabel;
    }
    if (partnerInput) {
      partnerInput.placeholder = nextTest.partnerPromptPlaceholder ?? "";
      if (!nextTest.requiresPartner) {
        partnerInput.value = "";
      }
    }
    const nextFeedItem = getSelectedFeedItem();
    if (selectedHeadline) {
      selectedHeadline.textContent = nextFeedItem?.title ?? nextTest.label;
    }
    if (selectedTeaser) {
      selectedTeaser.textContent = nextFeedItem?.teaser ?? nextTest.subtitle;
    }
    if (submitButton) {
      submitButton.disabled = Boolean(nextTest.lockedLabel);
      submitButton.textContent = nextTest.lockedLabel ?? args.startLabel;
    }
    composer?.classList.toggle("hidden", nextTest.interactionMode === "tap");
    tapPhotoButton?.classList.toggle("hidden", nextTest.interactionMode !== "tap");
    if (tapPhotoButton) {
      tapPhotoButton.textContent = nextTest.tapLabel;
      tapPhotoButton.disabled = Boolean(nextTest.lockedLabel);
    }

    panel.querySelectorAll<HTMLElement>("[data-test-id]").forEach((button) => {
      if (button.classList.contains("hud-feed-card")) {
        button.classList.toggle("selected", button.dataset.feedItemId === currentSelectedFeedItemId);
      }
    });
    syncLandingVisibility();
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

  panel.querySelector<HTMLButtonElement>('[data-action="toggle-settings"]')?.addEventListener("click", () => {
    settingsMenu?.classList.toggle("hidden");
  });
  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("[data-action='toggle-settings']") && !target?.closest("[data-settings-menu]")) {
      settingsMenu?.classList.add("hidden");
    }
  });

  function attachCardListeners() {
    panel.querySelectorAll<HTMLButtonElement>("[data-test-id]").forEach((button) => {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const testId = button.dataset.testId;
        const feedItemId = button.dataset.feedItemId;
        const lockedLabel = testsById.get(testId ?? "")?.lockedLabel;
        if (!testId) {
          return;
        }

        updateSelection(testId, feedItemId);
        panel.scrollTo({ top: 0, behavior: "smooth" });
        landingStory?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!lockedLabel) {
          args.onSelectTest(testId, feedItemId);
        }
      });
    });
  }

  tapPhotoButton?.addEventListener("click", submitCurrentSelection);
  primaryInput?.addEventListener("input", syncDraft);
  partnerInput?.addEventListener("input", syncDraft);

  const rerenderFeed = () => {
    if (hotStrip) {
      hotStrip.innerHTML = renderCards(feedItems.filter((item) => item.hot).slice(0, 4), "hot", "hud-feed-card--hot");
    }
    if (feedGrid) {
      feedGrid.innerHTML = renderCards(feedItems, "feed");
    }
    if (sentinel) {
      sentinel.textContent = hasMoreFeed ? args.feedLoadingLabel : "";
    }
    attachCardListeners();
    updateSelection(currentSelectedId, currentSelectedFeedItemId);
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

  panel.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(panel);
    const selectedTestId = String(form.get("selectedTestId") ?? currentSelectedId);
    if (!selectedTestId) {
      return;
    }
    const selectedTest = testsById.get(selectedTestId);
    if (selectedTest?.lockedLabel) {
      return;
    }
    syncDraft();
    args.onSubmit(
      selectedTestId,
      currentSelectedFeedItemId,
      String(form.get("primaryName") ?? ""),
      String(form.get("partnerName") ?? "")
    );
  });

  syncLandingVisibility();
  if (hasSelection()) {
    updateSelection(currentSelectedId, currentSelectedFeedItemId);
  }
  setHud(panel);
}
