import { setHud } from "../components/hud";

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
  socialSectionLabel: string;
  socialStatusLabel: string;
  socialMetaLabel: string;
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
  progressTitle: string;
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
  onSelectStory?: (testId: string, storyId: string) => void;
  onStartNext?: (testId: string, storyId: string, partnerName: string) => void;
  onShare: () => void;
  onReward: () => void;
  rewardVisible: boolean;
  accent: string;
  template?: "cosmic" | "spotlight" | "tabloid";
}): void {
  const panel = document.createElement("section");
  panel.className = "hud-panel hud-panel--result-feed hud-stack";
  const template = args.template ?? "cosmic";
  const nextStories = args.nextStories ?? [];
  const browseStories = args.browseStories ?? [];
  const allStories = [...nextStories, ...browseStories];
  let currentNextStoryId = nextStories[0]?.id ?? "";

  const getSelectedNextStory = () =>
    allStories.find((story) => story.id === currentNextStoryId) ?? nextStories[0] ?? browseStories[0];

  const renderNextStories = () =>
    nextStories
      .map((story) => {
        const selected = story.id === currentNextStoryId;
        return `
          <button
            class="hud-result-story ${selected ? "selected" : ""}"
            type="button"
            data-next-story-id="${story.id}"
            data-next-test-id="${story.testId}"
          >
            <span class="hud-result-story__media">
              <img class="hud-result-story__image" src="${story.imageUrl}" alt="${story.title}" />
              <span class="hud-feed-card__tag">${story.tag}</span>
            </span>
            <span class="hud-result-story__body">
              <strong>${story.title}</strong>
              <small>${story.teaser}</small>
              <em>${story.socialProof}</em>
            </span>
          </button>
        `;
      })
      .join("");

  const selectedNextStory = getSelectedNextStory();
  const retryPartnerVisible = args.retryPartnerVisible ?? true;

  panel.innerHTML = `
    <div class="hud-social-chrome hud-social-chrome--result">
      <div class="hud-social-chrome__brand">
        <strong>${args.socialBrandLabel}</strong>
        <span>${args.socialSectionLabel}</span>
      </div>
      <div class="hud-social-chrome__meta">
        <span class="hud-social-chrome__pill">${args.socialStatusLabel}</span>
        <span class="hud-social-chrome__text">${args.socialMetaLabel}</span>
      </div>
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
    ${
      args.progressionItems.length
        ? `
          <div class="hud-stack hud-progress-summary">
            <p class="hud-label">${args.progressTitle}</p>
            <div class="hud-stack hud-progress-list">
              ${args.progressionItems
                .map(
                  (item) => `
                    <div class="hud-progress-item">
                      <strong>${item.title}</strong>
                      <span>${item.detail}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        `
        : ""
    }
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
      nextStories.length
        ? `
          <div class="hud-result-continuation hud-stack">
            <div class="hud-result-continuation__copy">
              <span class="hud-label">${args.nextStoryLabel ?? ""}</span>
              <strong>${args.continueTitle ?? ""}</strong>
              <p class="hud-label">${args.continueBody ?? ""}</p>
            </div>
            <div class="hud-result-story-grid" data-next-story-grid>
              ${renderNextStories()}
            </div>
            <div class="hud-result-next hud-stack">
              <div class="hud-result-next__copy">
                <span class="hud-feed-card__tag hud-feed-card__tag--inline" data-next-story-tag>${selectedNextStory?.tag ?? ""}</span>
                <strong data-next-story-title>${selectedNextStory?.testLabel ?? ""}</strong>
                <p class="hud-label" data-next-story-subtitle>${selectedNextStory?.testSubtitle ?? ""}</p>
                <p class="hud-result-next__proof" data-next-story-proof>${selectedNextStory?.socialProof ?? ""}</p>
              </div>
              <input type="hidden" name="nextTestId" value="${selectedNextStory?.testId ?? ""}" />
              <p class="hud-result-next__name ${args.primaryName ? "" : "hidden"}">${args.keepNameLabel ?? ""}: <strong>${args.primaryName ?? ""}</strong></p>
              <label class="hud-stack ${selectedNextStory?.requiresPartner === false ? "hidden" : ""}" data-next-partner-field>
                <span class="hud-label" data-next-partner-label>${selectedNextStory?.partnerLabel ?? args.partnerLabel}</span>
                <input class="hud-input" name="nextPartnerName" maxlength="20" value="${args.partnerName}" autocomplete="off" />
              </label>
              <button class="hud-button" type="button" data-action="start-next">${args.nextStoryStartLabel ?? ""}</button>
            </div>
          </div>
          ${
            browseStories.length
              ? `
                <div class="hud-result-browse hud-stack">
                  <div class="hud-result-browse__copy">
                    <span class="hud-label">${args.nextStoryLabel ?? ""}</span>
                    <strong>${args.continueTitle ?? ""}</strong>
                    <p class="hud-label">${args.continueBody ?? ""}</p>
                  </div>
                  <div class="hud-result-popular-grid">
                    ${browseStories
                      .map((story) => {
                        const selected = story.id === currentNextStoryId;
                        return `
                          <button
                            class="hud-result-popular-card ${selected ? "selected" : ""}"
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
                        `;
                      })
                      .join("")}
                  </div>
                </div>
              `
              : ""
          }
        `
        : ""
    }
  `;

  const nextTestInput = panel.querySelector<HTMLInputElement>('input[name="nextTestId"]');
  const nextStoryTag = panel.querySelector<HTMLElement>("[data-next-story-tag]");
  const nextStoryTitle = panel.querySelector<HTMLElement>("[data-next-story-title]");
  const nextStorySubtitle = panel.querySelector<HTMLElement>("[data-next-story-subtitle]");
  const nextStoryProof = panel.querySelector<HTMLElement>("[data-next-story-proof]");
  const nextPartnerField = panel.querySelector<HTMLElement>("[data-next-partner-field]");
  const nextPartnerLabel = panel.querySelector<HTMLElement>("[data-next-partner-label]");
  const retryInput = panel.querySelector<HTMLInputElement>('input[name="retryPartnerName"]');
  const nextPartnerInput = panel.querySelector<HTMLInputElement>('input[name="nextPartnerName"]');
  const continuationSection = panel.querySelector<HTMLElement>(".hud-result-continuation");

  const syncPartnerDraft = (value: string, source: "retry" | "next") => {
    if (source !== "retry" && retryInput && retryInput.value !== value) {
      retryInput.value = value;
    }
    if (source !== "next" && nextPartnerInput && nextPartnerInput.value !== value) {
      nextPartnerInput.value = value;
    }
    args.onPartnerDraftChange?.(value);
  };

  const updateSelectedNextStory = (storyId: string) => {
    const nextStory = allStories.find((story) => story.id === storyId);
    if (!nextStory) {
      return;
    }

    currentNextStoryId = storyId;
    if (nextTestInput) {
      nextTestInput.value = nextStory.testId;
    }
    if (nextStoryTag) {
      nextStoryTag.textContent = nextStory.tag;
    }
    if (nextStoryTitle) {
      nextStoryTitle.textContent = nextStory.testLabel;
    }
    if (nextStorySubtitle) {
      nextStorySubtitle.textContent = nextStory.testSubtitle;
    }
    if (nextStoryProof) {
      nextStoryProof.textContent = nextStory.socialProof;
    }
    if (nextPartnerField) {
      nextPartnerField.classList.toggle("hidden", nextStory.requiresPartner === false);
    }
    if (nextPartnerLabel) {
      nextPartnerLabel.textContent = nextStory.partnerLabel ?? args.partnerLabel;
    }
    if (nextPartnerInput && nextStory.requiresPartner === false) {
      nextPartnerInput.value = "";
    }

    panel.querySelectorAll<HTMLElement>("[data-next-story-id]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.nextStoryId === storyId);
    });
  };

  panel.querySelectorAll<HTMLButtonElement>("[data-next-story-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const storyId = button.dataset.nextStoryId;
      const testId = button.dataset.nextTestId;
      if (!storyId) {
        return;
      }

      updateSelectedNextStory(storyId);
      if (testId && args.onSelectStory) {
        args.onSelectStory(testId, storyId);
        return;
      }

      continuationSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  retryInput?.addEventListener("input", () => {
    syncPartnerDraft(retryInput.value, "retry");
  });
  nextPartnerInput?.addEventListener("input", () => {
    syncPartnerDraft(nextPartnerInput.value, "next");
  });

  panel.querySelector('[data-action="share"]')?.addEventListener("click", args.onShare);
  panel.querySelector('[data-action="retry"]')?.addEventListener("click", () => {
    const partnerName = retryInput?.value ?? args.partnerName;
    args.onPartnerDraftChange?.(partnerName);
    args.onRetry(partnerName);
  });
  panel.querySelector('[data-action="start-next"]')?.addEventListener("click", () => {
    const testId = nextTestInput?.value;
    if (!testId || !args.onStartNext) {
      return;
    }

    const partnerName =
      nextPartnerField?.classList.contains("hidden") ? "" : nextPartnerInput?.value ?? args.partnerName;
    args.onPartnerDraftChange?.(partnerName);
    args.onStartNext(testId, currentNextStoryId, partnerName);
  });
  panel.querySelector('[data-action="reward"]')?.addEventListener("click", args.onReward);

  setHud(panel);
}
