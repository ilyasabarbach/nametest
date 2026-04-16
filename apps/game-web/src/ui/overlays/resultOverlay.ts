import { setHud } from "../components/hud";
import type { ArtifactTemplate } from "../components/artifactPresentation";
import type { HomeFeedLocale } from "@nametests/content-packs";
import type { ThemePreference } from "../themePreference";

type ResultStory = {
  id: string;
  testId: string;
  imageUrl: string;
  tag: string;
  title: string;
  teaser: string;
  socialProof: string;
  testLabel: string;
  testSubtitle: string;
  requiresPartner?: boolean;
  partnerLabel?: string;
};

type ResultArtifactState = {
  hook: string;
  title: string;
  body: string;
  insight: string;
  signature: string;
  shareHint: string;
  accent: string;
  badgeLabel?: string;
  posterImageDataUrl?: string;
};

export function showResultOverlay(args: {
  socialBrandLabel: string;
  homeButtonLabel: string;
  languageLabel: string;
  themeLabel: string;
  themePreference: ThemePreference;
  locales: Array<{ id: HomeFeedLocale; label: string; nativeLabel: string }>;
  currentLocale: HomeFeedLocale;
  hook: string;
  testLabel: string;
  title: string;
  body: string;
  insight: string;
  score: string;
  signature: string;
  signatureLabel: string;
  shareHint: string;
  shareLabel: string;
  shareStoryLabel?: string;
  remixTitle?: string;
  remixBody?: string;
  remixOptions?: Array<{ template: ArtifactTemplate; label: string }>;
  aiRemixLabel?: string;
  profilePhotoLabel?: string;
  progressTitle?: string;
  partnerName: string;
  partnerLabel: string;
  retryPartnerVisible?: boolean;
  retryLabel: string;
  rewardLabel: string;
  continueTitle?: string;
  continueBody?: string;
  nextStoryLabel?: string;
  nextStoryStartLabel?: string;
  keepNameLabel?: string;
  primaryName?: string;
  meta: Array<{ value: string; label: string }>;
  progressionItems: Array<{ title: string; detail: string }>;
  nextStories?: ResultStory[];
  browseStories?: ResultStory[];
  onPartnerDraftChange?: (partnerName: string) => void;
  onRetry: (partnerName: string) => void;
  onGoHome: () => void;
  onChangeLocale: (locale: HomeFeedLocale) => Promise<void> | void;
  onChangeTheme: (preference: ThemePreference) => void;
  onSelectStory?: (testId: string, storyId: string) => void;
  onStartNext?: (testId: string, storyId: string, partnerName: string) => void;
  onRequestAiRemix?: (template: ArtifactTemplate) => Promise<Partial<ResultArtifactState> | null>;
  onUseProfilePhoto?: (
    template: ArtifactTemplate,
    artifact: ResultArtifactState
  ) => Promise<Partial<ResultArtifactState> | null>;
  onShare: (template: ArtifactTemplate, artifact: ResultArtifactState) => void;
  onShareToStory?: (template: ArtifactTemplate, artifact: ResultArtifactState) => void;
  onPurchasePremium?: () => Promise<void>;
  onReward: () => void;
  rewardVisible: boolean;
  accent: string;
  template?: ArtifactTemplate;
  posterImageDataUrl?: string;
  badgeLabel?: string;
}): void {
  const panel = document.createElement("section");
  const template = args.template ?? "cosmic";
  let currentTemplate = template;
  let currentArtifact: ResultArtifactState = {
    hook: args.hook,
    title: args.title,
    body: args.body,
    insight: args.insight,
    signature: args.signature,
    shareHint: args.shareHint,
    accent: args.accent,
    badgeLabel: args.badgeLabel ?? "",
    posterImageDataUrl: args.posterImageDataUrl ?? ""
  };
  const stories = [...(args.nextStories ?? []), ...(args.browseStories ?? [])];
  const retryPartnerVisible = args.retryPartnerVisible ?? true;

  panel.className = "fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col pointer-events-auto transition-all duration-300";
  
  const localesHtml = args.locales.map((l) => 
    '<button class="text-left px-4 py-2 rounded border ' + (l.id === args.currentLocale ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-slate-300 hover:bg-white/5') + ' text-sm font-medium transition-colors" type="button" data-locale-id="' + l.id + '">' + l.nativeLabel + '</button>'
  ).join("");
  
  const metaHtml = args.meta.length ? 
    '<div class="flex justify-center gap-6 opacity-60 w-full mt-4 border-t border-white/10 pt-4">' + 
    args.meta.map(item => 
      '<div class="flex flex-col items-center"><span class="text-sm font-bold text-primary">' + item.value + '</span><span class="text-[9px] uppercase mt-1 tracking-tighter">' + item.label + '</span></div>'
    ).join("") + 
    '</div>' : '';

  const shareStoryHtml = args.onShareToStory ? 
    '<button type="button" class="bg-gradient-to-br from-secondary-container to-secondary text-white h-16 rounded-full flex items-center justify-center gap-3 font-bold text-sm shadow-xl active:scale-95 transition-transform" data-action="share-story"><span class="material-symbols-outlined">upload</span>' + (args.shareStoryLabel ?? "Share to story") + '</button>' : 
    '<button type="button" class="bg-surface-bright/20 backdrop-blur-xl border border-outline-variant/30 text-on-surface h-16 rounded-full flex items-center justify-center gap-3 font-bold text-sm hover:bg-surface-bright/40 transition-all active:scale-95" data-action="go-home"><span class="material-symbols-outlined text-primary">auto_awesome</span>✨ Play this test</button>';

  const remixOptionsHtml = args.remixOptions ? args.remixOptions.map(option => 
    '<button class="px-4 py-2 rounded-full border ' + (option.template === template ? "bg-primary/20 border-primary text-primary" : "border-white/10 text-slate-300 hover:bg-white/5") + ' text-xs font-bold transition-all" data-remix-template="' + option.template + '">' + option.label + '</button>'
  ).join("") : "";

  const aiRemixHtml = args.onRequestAiRemix ? '<button class="px-4 py-2 rounded-full bg-surface-bright/40 text-on-surface text-xs font-bold" data-action="ai-remix">' + (args.aiRemixLabel ?? "Make AI version") + '</button>' : '';

  const remixSectionHtml = args.remixOptions?.length ? 
    '<div class="w-full max-w-md mt-6 pt-6 border-t border-white/5"><span class="text-xs text-slate-400 block mb-3">' + (args.remixTitle ?? "AI Remixes") + '</span><div class="flex flex-wrap gap-2">' + remixOptionsHtml + aiRemixHtml + '</div></div>' : '';

  const storiesHtml = stories.map(story => 
    '<div class="bg-surface-container-low rounded-xl p-3 border border-white/5 cursor-pointer hover:border-primary/50 transition-colors group" data-next-story-id="' + story.id + '" data-next-test-id="' + story.testId + '"><div class="w-full aspect-video rounded-lg overflow-hidden relative mb-2"><img src="' + story.imageUrl + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div><strong class="text-xs block truncate">' + story.title + '</strong><span class="text-[10px] text-slate-400">' + story.teaser + '</span></div>'
  ).join("");

  const storiesSectionHtml = stories.length ? 
    '<div class="w-full max-w-md mt-10 pt-6 border-t border-white/5"><h3 class="text-lg font-bold mb-4">' + (args.continueTitle ?? "Keep Exploring") + '</h3><div class="grid grid-cols-2 gap-4">' + storiesHtml + '</div></div>' : '';

  panel.innerHTML = `
    <header class="fixed top-0 w-full z-[60] bg-slate-950/50 backdrop-blur-xl bg-gradient-to-b from-slate-900/20 to-transparent shadow-2xl shadow-purple-900/10 flex justify-between items-center px-6 py-4 pointer-events-auto">
      <div class="flex items-center gap-4 cursor-pointer" data-action="go-home">
        <span class="material-symbols-outlined text-purple-500">home</span>
      </div>
      <h1 class="text-xl font-black tracking-[0.2em] text-slate-100 uppercase font-headline">${args.socialBrandLabel}</h1>
      <div class="flex items-center gap-4 cursor-pointer" data-action="toggle-settings">
        <span class="material-symbols-outlined text-purple-500">settings</span>
      </div>
      <div class="fixed top-16 right-6 mt-2 hidden bg-surface-container-high rounded-xl p-4 shadow-2xl z-50 flex-col gap-2" data-settings-menu>
        <h3 class="text-sm font-bold text-primary border-b border-white/10 pb-2 mb-2">${args.languageLabel}</h3>
        ${localesHtml}
        <h3 class="text-sm font-bold text-primary border-b border-white/10 pb-2 mt-3 mb-2">${args.themeLabel}</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            class="px-3 py-2 rounded border ${args.themePreference === "auto" ? "border-primary text-primary bg-primary/10" : "border-transparent text-slate-300 hover:bg-white/5"} text-xs font-semibold transition-colors"
            type="button"
            data-theme-pref="auto"
          >
            Auto
          </button>
          <button
            class="px-3 py-2 rounded border ${args.themePreference === "light" ? "border-primary text-primary bg-primary/10" : "border-transparent text-slate-300 hover:bg-white/5"} text-xs font-semibold transition-colors"
            type="button"
            data-theme-pref="light"
          >
            Light
          </button>
          <button
            class="px-3 py-2 rounded border ${args.themePreference === "dark" ? "border-primary text-primary bg-primary/10" : "border-transparent text-slate-300 hover:bg-white/5"} text-xs font-semibold transition-colors"
            type="button"
            data-theme-pref="dark"
          >
            Dark
          </button>
        </div>
      </div>
    </header>
    
    <main class="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-40 relative">
      <div class="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <!-- Result Poster -->
      <div class="w-full max-w-md aspect-[3/4] relative rounded-[2.5rem] p-[1px] shadow-2xl overflow-hidden group" style="background: linear-gradient(135deg, ${args.accent}40 0%, transparent 100%);" data-result-poster>
        <div class="absolute inset-0 bg-surface-container-low/60 backdrop-blur-3xl rounded-[2.5rem]"></div>
        <img class="absolute inset-0 w-full h-full object-cover hidden opacity-80" data-artifact-poster-image />
        <div class="hud-result-poster__glow" style="--result-accent:${args.accent};"></div>
        <div class="relative h-full flex flex-col items-center justify-between p-10 text-center z-10">
          <div class="w-full flex justify-center mt-2">
            <div class="bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] hidden" data-artifact-badge>
              <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">verified</span>
              <span class="text-[10px] font-label uppercase tracking-widest font-bold text-primary" data-badge-text>${args.badgeLabel ?? ""}</span>
            </div>
          </div>
          
          <div class="space-y-2 mt-4 relative z-10">
            <p class="text-on-surface-variant text-sm font-label uppercase tracking-[0.3em]" data-artifact-hook>${args.hook}</p>
            <h2 class="text-[6rem] font-black leading-none tracking-tighter text-transparent bg-clip-text drop-shadow-[0_10px_30px_rgba(147,51,234,0.5)]" style="background-image: linear-gradient(to bottom, ${args.accent}, #fff);" data-artifact-title>
              ${args.title}
            </h2>
            <div class="hud-score text-2xl font-bold" style="color:${args.accent}">${args.score}</div>
          </div>
          
          <div class="space-y-6 relative z-10 w-full">
            <blockquote class="text-xl md:text-2xl font-headline font-bold text-on-surface leading-tight px-4 italic" data-artifact-insight>
              "${args.insight}"
            </blockquote>
            <p class="text-sm opacity-80" data-artifact-body>${args.body}</p>
            
            ${metaHtml}
          </div>
          
          <div class="pt-4 border-t border-white/5 w-full relative z-10">
            <p class="text-[10px] font-label tracking-widest text-on-surface-variant" data-artifact-signature>${args.signatureLabel}: ${args.signature}</p>
          </div>
        </div>
      </div>
      
      <!-- Action Area -->
      <p class="text-xs text-slate-400 mt-6 mb-2" data-artifact-share-hint>${args.shareHint}</p>
      
      <div class="w-full max-w-md mt-4 grid grid-cols-2 gap-4">
        <button type="button" class="bg-gradient-to-br from-primary-container to-primary text-on-primary-container h-16 rounded-full flex items-center justify-center gap-3 font-bold text-sm shadow-xl active:scale-95 transition-transform" data-action="share">
          <span class="material-symbols-outlined">share</span>
          ${args.shareLabel}
        </button>
        ${shareStoryHtml}
      </div>
      
      ${args.onPurchasePremium ? `
      <div class="w-full max-w-md mt-4">
        <button type="button" class="w-full bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border border-[#FFD700]/50 text-[#FFD700] h-14 rounded-full flex items-center justify-center gap-3 font-bold text-sm shadow-xl active:scale-95 transition-transform" data-action="purchase-premium">
          <span class="material-symbols-outlined">star</span>
          Unlock Premium Report (50 Stars)
        </button>
      </div>` : ''}
      
      ${remixSectionHtml}     
      ${storiesSectionHtml}
    </main>

    <div class="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"></div>
  `;

  const settingsMenu = panel.querySelector<HTMLElement>("[data-settings-menu]");
  const resultPoster = panel.querySelector<HTMLElement>("[data-result-poster]");
  const hookEl = panel.querySelector<HTMLElement>("[data-artifact-hook]");
  const titleEl = panel.querySelector<HTMLElement>("[data-artifact-title]");
  const bodyEl = panel.querySelector<HTMLElement>("[data-artifact-body]");
  const insightEl = panel.querySelector<HTMLElement>("[data-artifact-insight]");
  const signatureEl = panel.querySelector<HTMLElement>("[data-artifact-signature]");
  const shareHintEl = panel.querySelector<HTMLElement>("[data-artifact-share-hint]");
  const badgeEl = panel.querySelector<HTMLElement>("[data-artifact-badge]");
  const badgeTextEl = panel.querySelector<HTMLElement>("[data-badge-text]");
  const posterImageEl = panel.querySelector<HTMLImageElement>("[data-artifact-poster-image]");
  const profilePhotoButton = panel.querySelector<HTMLButtonElement>('[data-action="profile-photo"]');
  const aiRemixButton = panel.querySelector<HTMLButtonElement>('[data-action="ai-remix"]');

  panel.querySelectorAll<HTMLButtonElement>("[data-remix-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTemplate = button.dataset.remixTemplate as ArtifactTemplate | undefined;
      if (!nextTemplate || nextTemplate === currentTemplate) {
        return;
      }
      currentTemplate = nextTemplate;
      panel.querySelectorAll<HTMLElement>("[data-remix-template]").forEach((chip) => {
        chip.classList.toggle("bg-primary/20", chip.getAttribute("data-remix-template") === nextTemplate);
        chip.classList.toggle("border-primary", chip.getAttribute("data-remix-template") === nextTemplate);
        chip.classList.toggle("text-primary", chip.getAttribute("data-remix-template") === nextTemplate);
      });
    });
  });

  const applyArtifact = (nextArtifact: Partial<ResultArtifactState>) => {
    currentArtifact = {
      ...currentArtifact,
      ...nextArtifact
    };
    if (hookEl) {
      hookEl.textContent = currentArtifact.hook;
      hookEl.style.color = currentArtifact.accent;
    }
    if (titleEl) {
      titleEl.textContent = currentArtifact.title;
      titleEl.style.backgroundImage = 'linear-gradient(to bottom, ' + currentArtifact.accent + ', #fff)';
    }
    if (bodyEl) {
      bodyEl.textContent = currentArtifact.body;
    }
    if (insightEl) {
      insightEl.textContent = '"' + currentArtifact.insight + '"';
    }
    if (signatureEl) {
      signatureEl.textContent = `${args.signatureLabel}: ${currentArtifact.signature}`;
    }
    if (shareHintEl) {
      shareHintEl.textContent = currentArtifact.shareHint;
    }
    if (currentArtifact.posterImageDataUrl) {
      posterImageEl?.classList.remove("hidden");
      if (posterImageEl) {
        posterImageEl.src = currentArtifact.posterImageDataUrl;
      }
    } else {
      posterImageEl?.classList.add("hidden");
      if (posterImageEl) {
        posterImageEl.removeAttribute("src");
      }
    }
    if (resultPoster) {
      resultPoster.style.background = 'linear-gradient(135deg, ' + currentArtifact.accent + '40 0%, transparent 100%)';
    }
    
    if (currentArtifact.badgeLabel) {
      badgeEl?.classList.remove("hidden");
      if (badgeTextEl) {
        badgeTextEl.textContent = currentArtifact.badgeLabel;
      }
    } else {
      badgeEl?.classList.add("hidden");
    }
  };

  aiRemixButton?.addEventListener("click", async () => {
    if (!args.onRequestAiRemix || aiRemixButton.disabled) {
      return;
    }

    const idleLabel = aiRemixButton.textContent ?? (args.aiRemixLabel ?? "Make AI version");
    aiRemixButton.disabled = true;
    aiRemixButton.textContent = `${idleLabel}...`;
    try {
      const remixed = await args.onRequestAiRemix(currentTemplate);
      if (remixed) {
        applyArtifact(remixed);
      }
    } finally {
      aiRemixButton.textContent = idleLabel;
      aiRemixButton.disabled = false;
    }
  });

  profilePhotoButton?.addEventListener("click", async () => {
    if (!args.onUseProfilePhoto) {
      return;
    }

    profilePhotoButton.disabled = true;
    const previousLabel = profilePhotoButton.textContent;
    profilePhotoButton.textContent = `${args.profilePhotoLabel ?? "Use Google photo"}...`;
    try {
      const nextArtifact = await args.onUseProfilePhoto(currentTemplate, currentArtifact);
      if (nextArtifact) {
        applyArtifact(nextArtifact);
      }
    } finally {
      profilePhotoButton.disabled = false;
      profilePhotoButton.textContent = previousLabel;
    }
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-locale-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const localeId = button.dataset.localeId as HomeFeedLocale | undefined;
      if (!localeId || localeId === args.currentLocale) {
        return;
      }

      void args.onChangeLocale(localeId);
    });
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-theme-pref]").forEach((button) => {
    button.addEventListener("click", () => {
      const preference = button.dataset.themePref as ThemePreference | undefined;
      if (!preference) {
        return;
      }

      args.onChangeTheme(preference);
      panel.querySelectorAll<HTMLButtonElement>("[data-theme-pref]").forEach((entry) => {
        const selected = entry.dataset.themePref === preference;
        entry.classList.toggle("border-primary", selected);
        entry.classList.toggle("text-primary", selected);
        entry.classList.toggle("bg-primary/10", selected);
        entry.classList.toggle("border-transparent", !selected);
      });
    });
  });

  panel.querySelector<HTMLButtonElement>('[data-action="toggle-settings"]')?.addEventListener("click", () => {
    settingsMenu?.classList.toggle("hidden");
  });
  const handlePlatformSettingsToggle = () => {
    if (!panel.isConnected) {
      window.removeEventListener("platform:settings-toggle", handlePlatformSettingsToggle);
      return;
    }

    settingsMenu?.classList.toggle("hidden");
  };
  window.addEventListener("platform:settings-toggle", handlePlatformSettingsToggle);
  
  panel.querySelector<HTMLButtonElement>('[data-action="go-home"]')?.addEventListener("click", () => {
    args.onGoHome();
  });
  
  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("[data-action='toggle-settings']") && !target?.closest("[data-settings-menu]")) {
      settingsMenu?.classList.add("hidden");
    }
  });

  panel.querySelectorAll<HTMLElement>("[data-next-story-id]").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement;
      const storyId = target.dataset.nextStoryId;
      const testId = target.dataset.nextTestId;
      if (!storyId || !testId) {
        return;
      }

      args.onSelectStory?.(testId, storyId);
    });
  });

  panel.querySelector('[data-action="share"]')?.addEventListener("click", () => args.onShare(currentTemplate, currentArtifact));
  panel.querySelector('[data-action="share-story"]')?.addEventListener("click", () => args.onShareToStory?.(currentTemplate, currentArtifact));

  const premiumButton = panel.querySelector<HTMLButtonElement>('[data-action="purchase-premium"]');
  premiumButton?.addEventListener("click", async () => {
    if (!args.onPurchasePremium || premiumButton.disabled) return;
    
    const prevHtml = premiumButton.innerHTML;
    premiumButton.disabled = true;
    premiumButton.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Processing...`;
    
    try {
      await args.onPurchasePremium();
    } finally {
      premiumButton.disabled = false;
      premiumButton.innerHTML = prevHtml;
    }
  });

  setHud(panel);
}
