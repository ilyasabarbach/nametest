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
  showStats?: boolean;
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
  const showStats = args.showStats ?? true;

  const panel = document.createElement("form");
  panel.className = "fixed inset-0 z-50 overflow-y-auto overflow-x-hidden transition-all duration-300 pointer-events-auto bg-[#0f1014] text-[#dce1fb] font-body";
  panel.style.backgroundImage = 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(190, 0, 98, 0.08) 0%, transparent 40%)';
  panel.dir = args.currentLocale === "ar" ? "rtl" : "ltr";

  const hasSelection = () => Boolean(currentSelectedId);
  const getSelectedTest = () => testsById.get(currentSelectedId);
  const getSelectedFeedItem = () =>
    hasSelection()
      ? (feedItems.find((item) => item.id === currentSelectedFeedItemId) ??
        feedItems.find((item) => item.testId === currentSelectedId))
      : undefined;

  const renderCards = (items: FeedItem[]) =>
    items
      .map((item) => {
        const selected = item.id === currentSelectedFeedItemId;
        const lockedLabel = item.lockedLabel ?? testsById.get(item.testId)?.lockedLabel;
        return \`
          <div class="surface-container-low rounded-2xl p-4 border \${selected ? 'border-primary' : 'border-outline-variant/5'} shadow-lg flex flex-col gap-4 group cursor-pointer" data-test-id="\${item.testId}" data-feed-item-id="\${item.id}">
            <div class="aspect-square rounded-xl overflow-hidden bg-surface-container-highest relative">
              \${lockedLabel ? \`<div class="absolute inset-0 bg-black/60 z-10 flex items-center justify-center"><span class="text-xs font-bold text-white">\${lockedLabel}</span></div>\` : ''}
              <img class="w-full h-full object-cover transition duration-500 group-hover:scale-110 \${lockedLabel ? 'grayscale' : ''}" src="\${item.imageUrl}" alt="\${item.title}" />
              \${item.hot ? \`<div class="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow animate-pulse">\${args.hotLabel}</div>\` : ''}
            </div>
            <div class="space-y-1">
              <h3 class="font-bold text-sm text-on-surface truncate">\${item.title}</h3>
              <p class="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase truncate">\${item.teaser}</p>
            </div>
          </div>
        \`;
      })
      .join("");

  panel.innerHTML = \`
    <header class="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(147,51,234,0.1)] flex justify-between items-center px-6 h-16 w-full pointer-events-auto">
      <button type="button" class="text-slate-500 hover:text-purple-200 transition-colors active:scale-95 duration-300">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-600 font-headline uppercase tracking-[0.2em] text-xs pb-1" data-app-title>\${args.socialBrandLabel}</h1>
      <button type="button" class="text-slate-500 hover:text-purple-200 transition-colors active:scale-95 duration-300" data-action="toggle-settings">
        <span class="material-symbols-outlined">settings</span>
      </button>
    </header>
    
    <div class="fixed top-16 right-6 mt-2 hidden bg-surface-container-high rounded-xl p-4 shadow-2xl z-50 flex-col gap-2" data-settings-menu>
      <h3 class="text-sm font-bold text-primary border-b border-white/10 pb-2 mb-2">\${args.languageLabel}</h3>
      \${args.locales
        .map(
          (locale) => \`
            <button
              class="text-left px-4 py-2 rounded border \${locale.id === args.currentLocale ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-slate-300 hover:bg-white/5'} text-sm font-medium transition-colors"
              type="button"
              data-locale-id="\${locale.id}"
            >
              \${locale.nativeLabel}
            </button>
          \`
        )
        .join("")}
    </div>

    <!-- Feed View -->
    <main class="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-10 transition-opacity duration-300" data-view="feed">
      \${args.feedItems.length > 0 ? \`
        <!-- Hero Card -->
        <section class="relative group cursor-pointer" data-test-id="\${feedItems[0].testId}" data-feed-item-id="\${feedItems[0].id}">
          <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative bg-surface-container-highest rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10">
            <div class="h-64 w-full relative overflow-hidden">
              <img class="w-full h-full object-cover transition duration-700 group-hover:scale-105" src="\${feedItems[0].imageUrl}" />
              <div class="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent"></div>
            </div>
            <div class="p-8 space-y-4">
              <div class="space-y-1">
                <span class="font-bold uppercase tracking-widest text-primary text-[10px]">\${args.dailyLabel}</span>
                <h2 class="text-3xl font-extrabold tracking-tight text-on-surface">\${feedItems[0].title}</h2>
              </div>
              <p class="text-on-surface-variant text-sm leading-relaxed max-w-xs">\${feedItems[0].teaser}</p>
              <button type="button" class="mt-4 px-8 py-4 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-bold rounded-full shadow-[0_0_25px_rgba(147,51,234,0.4)] active:scale-95 transition-transform pointer-events-none">
                \${args.startLabel}
              </button>
            </div>
          </div>
        </section>
      \` : ''}

      \${showStats ? \`
        <!-- Stat Pills -->
        <section class="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          <div class="flex-shrink-0 bg-surface-container-highest/40 backdrop-blur-xl border border-white/5 rounded-full px-5 py-2.5 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-sm">local_fire_department</span>
            <span class="text-xs font-semibold tracking-wide text-on-surface">\${args.streakValue} \${args.streakLabel}</span>
          </div>
          <div class="flex-shrink-0 bg-surface-container-highest/40 backdrop-blur-xl border border-white/5 rounded-full px-5 py-2.5 flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-sm">play_circle</span>
            <span class="text-xs font-semibold tracking-wide text-on-surface">\${args.sessionsValue} \${args.sessionsLabel}</span>
          </div>
          <div class="flex-shrink-0 bg-surface-container-highest/40 backdrop-blur-xl border border-white/5 rounded-full px-5 py-2.5 flex items-center gap-2">
            <span class="material-symbols-outlined text-tertiary text-sm">monetization_on</span>
            <span class="text-xs font-semibold tracking-wide text-on-surface">\${args.rewardValue} \${args.rewardsLabel}</span>
          </div>
        </section>
      \` : ''}

      <!-- Feed Grid -->
      <section class="grid grid-cols-2 gap-4" data-feed-grid>
        \${renderCards(feedItems.slice(1))}
      </section>
      <div class="text-center py-4 text-xs font-label uppercase tracking-widest text-slate-500" data-feed-sentinel>\${hasMoreFeed ? args.feedLoadingLabel : ""}</div>
    </main>

    <!-- Composer View (Input Form) styling taken explicitly from Stitch TestScene.ts prompt !-->
    <main class="hidden absolute inset-0 z-50 pt-24 pb-40 px-6 max-w-md mx-auto w-full bg-[#0c1324] backdrop-blur-xl transition-opacity duration-300 transform" data-view="composer" style="background: radial-gradient(circle at 50% -20%, rgba(147, 51, 234, 0.15) 0%, rgba(12, 19, 36, 1) 70%); min-height: 100vh;">
      <input type="hidden" name="selectedTestId" value="\${currentSelectedId}" />
      
      <div class="flex justify-between items-center mb-10 w-full cursor-pointer" data-action="close-composer">
          <span class="material-symbols-outlined text-purple-400">arrow_back</span>
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Back</span>
      </div>

      <div class="mb-12 text-center mt-4">
        <span class="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-2 block" data-selected-teaser></span>
        <h2 class="text-4xl font-extrabold tracking-tight text-on-surface leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" data-selected-title></h2>
        <p class="text-sm mt-4 text-slate-400" data-selected-subtitle></p>
      </div>

      <div class="space-y-4 relative w-full" data-form-fields>
        <div class="group relative w-full" data-primary-field>
          <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2 ml-4" data-primary-label>\${args.primaryLabel}</label>
          <div class="bg-[rgba(21,27,45,0.6)] backdrop-blur-md rounded-2xl p-[1px] bg-gradient-to-b from-purple-500/30 to-transparent focus-within:from-purple-500 transition-all duration-500 w-full border border-white/5 shadow-2xl">
            <input class="w-full bg-surface-container-lowest/80 border-none rounded-2xl px-6 py-5 text-on-surface placeholder:text-slate-600 focus:ring-0 text-lg font-medium tracking-wide outline-none placeholder-slate-600 focus:placeholder-transparent" name="primaryName" maxlength="20" autocomplete="off" value="\${args.defaultPrimaryName}" type="text" />
          </div>
        </div>

        <div class="flex justify-center -my-3 relative z-10 hidden" data-camera-button>
          <button type="button" class="w-14 h-14 rounded-full bg-[rgba(21,27,45,0.9)] backdrop-blur-xl flex items-center justify-center text-primary shadow-2xl border border-white/10 hover:scale-110 active:scale-95 transition-transform" data-action="tap-photo">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">photo_camera</span>
          </button>
        </div>

        <div class="group relative w-full" data-partner-field>
          <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2 ml-4" data-partner-label>\${args.partnerLabel}</label>
          <div class="bg-[rgba(21,27,45,0.6)] backdrop-blur-md rounded-2xl p-[1px] bg-gradient-to-b from-purple-500/30 to-transparent focus-within:from-purple-500 transition-all duration-500 w-full border border-white/5 shadow-2xl">
            <input class="w-full bg-surface-container-lowest/80 border-none rounded-2xl px-6 py-5 text-on-surface placeholder:text-slate-600 focus:ring-0 text-lg font-medium tracking-wide outline-none placeholder-slate-600 focus:placeholder-transparent" name="partnerName" maxlength="20" autocomplete="off" value="\${args.defaultPartnerName}" type="text" />
          </div>
        </div>
      </div>

      <div class="fixed bottom-28 left-0 w-full px-6 flex flex-col items-center justify-center z-40 bg-gradient-to-t from-[#0c1324] via-[#0c1324] to-transparent pt-10 pb-6 w-full">
        <button type="submit" class="w-full max-w-sm h-20 rounded-2xl bg-gradient-to-r from-tertiary-container via-primary-container to-secondary-container text-white font-black text-lg tracking-[0.1em] uppercase shadow-[0_20px_50px_rgba(147,51,234,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-transform w-[90%] mx-auto">
          <span>\${args.startLabel}</span>
          <span class="material-symbols-outlined">flare</span>
        </button>
        <p class="text-[9px] mt-4 text-slate-500 text-center">\${args.privacyLabel}</p>
      </div>
    </main>

    <nav class="fixed bottom-0 w-full bg-slate-950/90 backdrop-blur-2xl rounded-t-[2rem] z-50 flex justify-around items-center px-8 pb-6 pt-4 shadow-[0_-10px_40px_rgba(147,51,234,0.15)] pointer-events-auto">
      <button type="button" class="bg-purple-500/20 text-purple-300 rounded-full p-3 shadow-[0_0_15px_rgba(147,51,234,0.4)] active:scale-90 duration-200 transition-all">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">explore</span>
      </button>
      <button type="button" class="text-slate-600 p-3 hover:text-purple-400 active:scale-90 duration-200 transition-all">
        <span class="material-symbols-outlined">auto_awesome</span>
      </button>
      <button type="button" class="text-slate-600 p-3 hover:text-purple-400 active:scale-90 duration-200 transition-all">
        <span class="material-symbols-outlined">person</span>
      </button>
    </nav>
  \`;

  const viewFeed = panel.querySelector<HTMLElement>('[data-view="feed"]');
  const viewComposer = panel.querySelector<HTMLElement>('[data-view="composer"]');
  
  const selectedTitle = panel.querySelector<HTMLElement>("[data-selected-title]");
  const selectedSubtitle = panel.querySelector<HTMLElement>("[data-selected-subtitle]");
  const selectedTeaser = panel.querySelector<HTMLElement>("[data-selected-teaser]");
  const selectedInput = panel.querySelector<HTMLInputElement>('input[name="selectedTestId"]');
  const submitButton = panel.querySelector<HTMLButtonElement>('button[type="submit"]');
  
  const primaryField = panel.querySelector<HTMLElement>("[data-primary-field]");
  const partnerField = panel.querySelector<HTMLElement>("[data-partner-field]");
  const formFields = panel.querySelector<HTMLElement>("[data-form-fields]");
  
  const primaryInput = panel.querySelector<HTMLInputElement>('input[name="primaryName"]');
  const partnerInput = panel.querySelector<HTMLInputElement>('input[name="partnerName"]');
  const primaryLabelHtml = panel.querySelector<HTMLElement>("[data-primary-label]");
  const partnerLabelHtml = panel.querySelector<HTMLElement>("[data-partner-label]");
  const tapPhotoButton = panel.querySelector<HTMLButtonElement>('[data-action="tap-photo"]');
  const cameraButtonWrap = panel.querySelector<HTMLElement>('[data-camera-button]');
  const titleBarText = panel.querySelector<HTMLElement>("[data-app-title]");

  const feedGrid = panel.querySelector<HTMLElement>("[data-feed-grid]");
  const sentinel = panel.querySelector<HTMLElement>("[data-feed-sentinel]");
  const settingsMenu = panel.querySelector<HTMLElement>("[data-settings-menu]");

  const syncDraft = () => {
    args.onDraftChange(primaryInput?.value ?? "", partnerInput?.value ?? "");
  };

  const submitCurrentSelection = () => {
    if (!currentSelectedId) return;
    if (testsById.get(currentSelectedId)?.lockedLabel) return;
    syncDraft();
    args.onSubmit(currentSelectedId, currentSelectedFeedItemId, primaryInput?.value ?? "", partnerInput?.value ?? "");
  };

  const updateSelection = (testId: string, feedItemId?: string) => {
    const nextTest = testsById.get(testId);
    if (!nextTest) return;

    currentSelectedId = testId;
    currentSelectedFeedItemId =
      feedItems.find((item) => item.id === feedItemId && item.testId === testId)?.id ??
      feedItems.find((item) => item.testId === testId)?.id ??
      currentSelectedFeedItemId;
      
    if (selectedInput) selectedInput.value = testId;
    
    if (selectedTitle) selectedTitle.textContent = nextTest.label;
    if (selectedSubtitle) selectedSubtitle.textContent = nextTest.subtitle;
    if (primaryLabelHtml) primaryLabelHtml.textContent = nextTest.primaryPromptLabel;
    if (primaryInput) primaryInput.placeholder = nextTest.primaryPromptPlaceholder;
    
    if (partnerField) partnerField.classList.toggle("hidden", !nextTest.requiresPartner);
    if (partnerLabelHtml) partnerLabelHtml.textContent = nextTest.partnerPromptLabel ?? args.partnerLabel;
    if (partnerInput) {
      partnerInput.placeholder = nextTest.partnerPromptPlaceholder ?? "";
      if (!nextTest.requiresPartner) partnerInput.value = "";
    }
    
    const nextFeedItem = getSelectedFeedItem();
    if (selectedTeaser) selectedTeaser.textContent = nextFeedItem?.teaser ?? nextTest.subtitle;
    
    if (submitButton) {
      submitButton.disabled = Boolean(nextTest.lockedLabel);
      submitButton.querySelector('span')!.textContent = nextTest.lockedLabel ?? args.startLabel;
      submitButton.classList.toggle("hidden", nextTest.interactionMode === "tap");
    }
    
    formFields?.classList.toggle("hidden", nextTest.interactionMode === "tap");
    cameraButtonWrap?.classList.toggle("hidden", nextTest.interactionMode !== "tap");
    if (tapPhotoButton) tapPhotoButton.disabled = Boolean(nextTest.lockedLabel);
    
    viewFeed?.classList.add("hidden");
    viewComposer?.classList.remove("hidden");
    if (titleBarText) titleBarText.style.opacity = '0';
  };

  panel.querySelector('[data-action="close-composer"]')?.addEventListener("click", () => {
    viewFeed?.classList.remove("hidden");
    viewComposer?.classList.add("hidden");
    if (titleBarText) titleBarText.style.opacity = '1';
    currentSelectedId = "";
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-locale-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const localeId = button.dataset.localeId as HomeFeedLocale | undefined;
      if (!localeId || localeId === args.currentLocale) return;
      void args.onChangeLocale(localeId);
    });
  });

  panel.querySelector<HTMLButtonElement>('[data-action="toggle-settings"]')?.addEventListener("click", () => {
    settingsMenu?.classList.toggle("hidden");
  });

  function attachCardListeners() {
    panel.querySelectorAll<HTMLElement>("[data-test-id]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", (e) => {
        // Find closest parent just in case
        const target = e.currentTarget as HTMLElement;
        const testId = target.dataset.testId;
        const feedItemId = target.dataset.feedItemId;
        const lockedLabel = testsById.get(testId ?? "")?.lockedLabel;
        if (!testId) return;

        updateSelection(testId, feedItemId);
      });
    });
  }

  tapPhotoButton?.addEventListener("click", submitCurrentSelection);
  primaryInput?.addEventListener("input", syncDraft);
  partnerInput?.addEventListener("input", syncDraft);

  const rerenderFeed = () => {
    if (feedGrid) feedGrid.innerHTML = renderCards(feedItems.slice(1));
    if (sentinel) sentinel.textContent = hasMoreFeed ? args.feedLoadingLabel : "";
    attachCardListeners();
  };

  attachCardListeners();

  const loadMore = async () => {
    if (!hasMoreFeed || loadingMore) return;
    loadingMore = true;
    const nextPage = await args.onLoadMore();
    hasMoreFeed = nextPage.hasMore;
    if (nextPage.items.length > 0) {
      feedItems = [...feedItems, ...nextPage.items];
      rerenderFeed();
    }
    loadingMore = false;
    if (sentinel && !hasMoreFeed) sentinel.textContent = "";
  };

  if (sentinel && hasMoreFeed && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore();
    }, { root: panel, rootMargin: "240px 0px" });
    observer.observe(sentinel);
  }

  panel.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(panel);
    const selectedTestId = String(form.get("selectedTestId") ?? currentSelectedId);
    if (!selectedTestId) return;
    const selectedTest = testsById.get(selectedTestId);
    if (selectedTest?.lockedLabel) return;
    
    syncDraft();
    args.onSubmit(
      selectedTestId,
      currentSelectedFeedItemId,
      String(form.get("primaryName") ?? ""),
      String(form.get("partnerName") ?? "")
    );
  });

  if (hasSelection()) {
    updateSelection(currentSelectedId, currentSelectedFeedItemId);
  }
  setHud(panel);
}
