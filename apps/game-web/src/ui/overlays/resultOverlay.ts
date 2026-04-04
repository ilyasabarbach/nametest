import { setHud } from "../components/hud";
import type { ArtifactTemplate } from "../components/artifactPresentation";
import type { HomeFeedLocale } from "@nametests/content-packs";

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
  onSelectStory?: (testId: string, storyId: string) => void;
  onStartNext?: (testId: string, storyId: string, partnerName: string) => void;
  onRequestAiRemix?: (template: ArtifactTemplate) => Promise<Partial<ResultArtifactState> | null>;
  onUseProfilePhoto?: (
    template: ArtifactTemplate,
    artifact: ResultArtifactState
  ) => Promise<Partial<ResultArtifactState> | null>;
  onShare: (template: ArtifactTemplate, artifact: ResultArtifactState) => void;
  onShareToStory?: (template: ArtifactTemplate, artifact: ResultArtifactState) => void;
  onReward: () => void;
  rewardVisible: boolean;
  accent: string;
  template?: ArtifactTemplate;
  posterImageDataUrl?: string;
  badgeLabel?: string;
}): void {
  const panel = document.createElement("section");
  panel.className = "hud-panel hud-panel--result-feed hud-stack";
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

  panel.innerHTML = `
    <div class="hud-social-chrome hud-social-chrome--result">
      <div class="hud-social-chrome__left">
        <button class="hud-nav-button hud-icon-button" type="button" data-action="go-home" title="${args.homeButtonLabel}" aria-label="${args.homeButtonLabel}">
          &#8962;
        </button>
        <button class="hud-settings-button hud-icon-button" type="button" data-action="toggle-settings" title="${args.languageLabel}" aria-label="${args.languageLabel}">
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
      <div class="hud-social-chrome__logo">
        <strong>${args.socialBrandLabel}</strong>
      </div>
      <div class="hud-social-chrome__right"></div>
    </div>
    <div class="hud-result-poster hud-result-poster--${template} hud-stack" data-result-poster>
      <div class="hud-result-poster__glow" style="--result-accent:${args.accent};"></div>
      <img class="hud-result-poster__image hidden" data-artifact-poster-image alt="${args.testLabel}" />
      <div class="hud-result-poster__content hud-stack">
        <span class="hud-result-kicker">${args.testLabel}</span>
        <span class="hud-result-ai-badge hidden" data-artifact-badge></span>
        <p class="hud-result-hook" style="color:${args.accent}" data-artifact-hook>${args.hook}</p>
        <h2 data-artifact-title>${args.title}</h2>
        <div class="hud-score" style="color:${args.accent}">${args.score}</div>
        <p data-artifact-body>${args.body}</p>
        <p class="hud-label" data-artifact-insight>${args.insight}</p>
        <p class="hud-label" data-artifact-signature>${args.signatureLabel}: ${args.signature}</p>
      </div>
      <p class="hud-result-share-hint" data-artifact-share-hint>${args.shareHint}</p>
    </div>
    <div class="hud-pill-row hud-pill-row-wide">
      ${args.meta
        .map(
          (item) => `
            <div class="hud-pill">
              <strong>${item.value}</strong>
              <span>${item.label}</span>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="hud-result-actions hud-stack">
      <label class="hud-stack ${retryPartnerVisible ? "" : "hidden"}" data-retry-partner-field>
        <span class="hud-label">${args.partnerLabel}</span>
        <input class="hud-input" name="retryPartnerName" maxlength="20" value="${args.partnerName}" autocomplete="off" />
      </label>
      <div class="hud-result-actions__buttons">
        <button class="hud-button" type="button" data-action="share">${args.shareLabel}</button>
        ${
          args.onShareToStory
            ? `<button class="hud-button secondary hud-button--story" type="button" data-action="share-story">${args.shareStoryLabel ?? "Share to story"}</button>`
            : ""
        }
        <button class="hud-button secondary" type="button" data-action="retry">${args.retryLabel}</button>
        ${args.rewardVisible ? `<button class="hud-button secondary" type="button" data-action="reward">${args.rewardLabel}</button>` : ""}
      </div>
    </div>
    ${
      args.remixOptions?.length
        ? `
          <div class="hud-result-remix hud-stack">
            <div class="hud-result-remix__copy">
              <span class="hud-label">${args.remixTitle ?? ""}</span>
              <strong>${args.remixBody ?? ""}</strong>
            </div>
            <div class="hud-result-remix__buttons">
              ${args.remixOptions
                .map(
                  (option) => `
                    <button
                      class="hud-remix-chip ${option.template === template ? "selected" : ""}"
                      type="button"
                      data-remix-template="${option.template}"
                    >
                      ${option.label}
                    </button>
                  `
                )
                .join("")}
              ${
                args.onUseProfilePhoto
                  ? `<button class="hud-remix-chip hud-remix-chip--photo" type="button" data-action="profile-photo">${args.profilePhotoLabel ?? "Use Google photo"}</button>`
                  : ""
              }
              ${
                args.onRequestAiRemix
                  ? `<button class="hud-remix-chip hud-remix-chip--ai" type="button" data-action="ai-remix">${args.aiRemixLabel ?? "Make AI version"}</button>`
                  : ""
              }
            </div>
          </div>
        `
        : ""
    }
    ${
      stories.length
        ? `
          <div class="hud-result-browse hud-stack">
            <div class="hud-result-browse__copy">
              <span class="hud-label">${args.nextStoryLabel ?? ""}</span>
              <strong>${args.continueTitle ?? ""}</strong>
              <p class="hud-label">${args.continueBody ?? ""}</p>
            </div>
            <div class="hud-result-popular-grid">
              ${stories
                .map(
                  (story) => `
                    <button
                      class="hud-result-popular-card"
                      type="button"
                      data-next-story-id="${story.id}"
                      data-next-test-id="${story.testId}"
                    >
                      <span class="hud-result-popular-card__media">
                        <img class="hud-result-popular-card__image" src="${story.imageUrl}" alt="${story.title}" />
                        <span class="hud-feed-card__tag">${story.tag}</span>
                      </span>
                      <span class="hud-result-popular-card__body">
                        <strong>${story.title}</strong>
                        <small>${story.teaser}</small>
                        <em>${story.socialProof}</em>
                      </span>
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        `
        : ""
    }
  `;

  const retryInput = panel.querySelector<HTMLInputElement>('input[name="retryPartnerName"]');
  const settingsMenu = panel.querySelector<HTMLElement>("[data-settings-menu]");
  const resultPoster = panel.querySelector<HTMLElement>("[data-result-poster]");
  const glowEl = panel.querySelector<HTMLElement>(".hud-result-poster__glow");
  const hookEl = panel.querySelector<HTMLElement>("[data-artifact-hook]");
  const titleEl = panel.querySelector<HTMLElement>("[data-artifact-title]");
  const bodyEl = panel.querySelector<HTMLElement>("[data-artifact-body]");
  const insightEl = panel.querySelector<HTMLElement>("[data-artifact-insight]");
  const signatureEl = panel.querySelector<HTMLElement>("[data-artifact-signature]");
  const shareHintEl = panel.querySelector<HTMLElement>("[data-artifact-share-hint]");
  const badgeEl = panel.querySelector<HTMLElement>("[data-artifact-badge]");
  const posterImageEl = panel.querySelector<HTMLImageElement>("[data-artifact-poster-image]");
  const profilePhotoButton = panel.querySelector<HTMLButtonElement>('[data-action="profile-photo"]');
  const aiRemixButton = panel.querySelector<HTMLButtonElement>('[data-action="ai-remix"]');

  retryInput?.addEventListener("input", () => {
    args.onPartnerDraftChange?.(retryInput.value);
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-remix-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTemplate = button.dataset.remixTemplate as ArtifactTemplate | undefined;
      if (!nextTemplate || nextTemplate === currentTemplate) {
        return;
      }

      resultPoster?.classList.remove(`hud-result-poster--${currentTemplate}`);
      resultPoster?.classList.add(`hud-result-poster--${nextTemplate}`);
      currentTemplate = nextTemplate;

      panel.querySelectorAll<HTMLElement>("[data-remix-template]").forEach((chip) => {
        chip.classList.toggle("selected", chip.getAttribute("data-remix-template") === nextTemplate);
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
    }
    if (bodyEl) {
      bodyEl.textContent = currentArtifact.body;
    }
    if (insightEl) {
      insightEl.textContent = currentArtifact.insight;
    }
    if (signatureEl) {
      signatureEl.textContent = `${args.signatureLabel}: ${currentArtifact.signature}`;
    }
    if (shareHintEl) {
      shareHintEl.textContent = currentArtifact.shareHint;
    }
    if (currentArtifact.posterImageDataUrl) {
      panel.classList.add("hud-panel--poster-focus");
      posterImageEl?.classList.remove("hidden");
      if (posterImageEl) {
        posterImageEl.src = currentArtifact.posterImageDataUrl;
      }
      resultPoster?.classList.add("hud-result-poster--image-mode");
    } else {
      panel.classList.remove("hud-panel--poster-focus");
      posterImageEl?.classList.add("hidden");
      resultPoster?.classList.remove("hud-result-poster--image-mode");
      if (posterImageEl) {
        posterImageEl.removeAttribute("src");
      }
    }
    resultPoster?.style.setProperty("--result-accent", currentArtifact.accent);
    glowEl?.style.setProperty("--result-accent", currentArtifact.accent);
    if (currentArtifact.badgeLabel) {
      badgeEl?.classList.remove("hidden");
      if (badgeEl) {
        badgeEl.textContent = currentArtifact.badgeLabel;
      }
      resultPoster?.classList.add("hud-result-poster--ai");
      aiRemixButton?.classList.add("selected");
    } else {
      badgeEl?.classList.add("hidden");
      resultPoster?.classList.remove("hud-result-poster--ai");
      aiRemixButton?.classList.remove("selected");
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

  panel.querySelectorAll<HTMLButtonElement>("[data-next-story-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const storyId = button.dataset.nextStoryId;
      const testId = button.dataset.nextTestId;
      if (!storyId || !testId) {
        return;
      }

      args.onSelectStory?.(testId, storyId);
    });
  });

  panel.querySelector('[data-action="share"]')?.addEventListener("click", () => args.onShare(currentTemplate, currentArtifact));
  panel.querySelector('[data-action="share-story"]')?.addEventListener("click", () => args.onShareToStory?.(currentTemplate, currentArtifact));
  panel.querySelector('[data-action="retry"]')?.addEventListener("click", () => {
    const partnerName = retryInput?.value ?? args.partnerName;
    args.onPartnerDraftChange?.(partnerName);
    args.onRetry(partnerName);
  });
  panel.querySelector('[data-action="reward"]')?.addEventListener("click", args.onReward);

  if (currentArtifact.posterImageDataUrl) {
    panel.classList.add("hud-panel--poster-focus");
  }

  setHud(panel);
}
