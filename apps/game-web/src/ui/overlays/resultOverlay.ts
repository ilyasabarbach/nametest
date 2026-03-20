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
  onShare: () => void;
  onReward: () => void;
  rewardVisible: boolean;
  accent: string;
  template?: ArtifactTemplate;
}): void {
  const panel = document.createElement("section");
  panel.className = "hud-panel hud-panel--result-feed hud-stack";
  const template = args.template ?? "cosmic";
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
    <div class="hud-result-poster hud-result-poster--${template} hud-stack">
      <div class="hud-result-poster__glow" style="--result-accent:${args.accent};"></div>
      <div class="hud-result-poster__content hud-stack">
        <span class="hud-result-kicker">${args.testLabel}</span>
        <p class="hud-result-hook" style="color:${args.accent}">${args.hook}</p>
        <h2>${args.title}</h2>
        <div class="hud-score" style="color:${args.accent}">${args.score}</div>
        <p>${args.body}</p>
        <p class="hud-label">${args.insight}</p>
        <p class="hud-label">${args.signatureLabel}: ${args.signature}</p>
      </div>
      <p class="hud-result-share-hint">${args.shareHint}</p>
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
        <button class="hud-button secondary" type="button" data-action="retry">${args.retryLabel}</button>
        ${args.rewardVisible ? `<button class="hud-button secondary" type="button" data-action="reward">${args.rewardLabel}</button>` : ""}
      </div>
    </div>
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

  retryInput?.addEventListener("input", () => {
    args.onPartnerDraftChange?.(retryInput.value);
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

  panel.querySelector('[data-action="share"]')?.addEventListener("click", args.onShare);
  panel.querySelector('[data-action="retry"]')?.addEventListener("click", () => {
    const partnerName = retryInput?.value ?? args.partnerName;
    args.onPartnerDraftChange?.(partnerName);
    args.onRetry(partnerName);
  });
  panel.querySelector('[data-action="reward"]')?.addEventListener("click", args.onReward);

  setHud(panel);
}
