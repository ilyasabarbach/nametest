import { setHud } from "../components/hud";

export function showResultOverlay(args: {
  hook: string;
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
  retryLabel: string;
  rewardLabel: string;
  meta: Array<{ value: string; label: string }>;
  progressionItems: Array<{ title: string; detail: string }>;
  onRetry: (partnerName: string) => void;
  onShare: () => void;
  onReward: () => void;
  rewardVisible: boolean;
  accent: string;
}): void {
  const panel = document.createElement("section");
  panel.className = "hud-panel hud-stack";

  panel.innerHTML = `
    <div class="hud-stack">
      <p class="hud-result-hook" style="color:${args.accent}">${args.hook}</p>
      <h2>${args.title}</h2>
      <div class="hud-score" style="color:${args.accent}">${args.score}</div>
      <p>${args.body}</p>
      <p class="hud-label">${args.insight}</p>
      <p class="hud-label">${args.signatureLabel}: ${args.signature}</p>
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
    <label class="hud-stack">
      <span class="hud-label">${args.partnerLabel}</span>
      <input class="hud-input" name="retryPartnerName" maxlength="20" value="${args.partnerName}" autocomplete="off" />
    </label>
    <button class="hud-button" data-action="share">${args.shareLabel}</button>
    <button class="hud-button secondary" data-action="retry">${args.retryLabel}</button>
    ${args.rewardVisible ? `<button class="hud-button secondary" data-action="reward">${args.rewardLabel}</button>` : ""}
  `;

  panel.querySelector('[data-action="share"]')?.addEventListener("click", args.onShare);
  panel.querySelector('[data-action="retry"]')?.addEventListener("click", () => {
    const input = panel.querySelector<HTMLInputElement>('input[name="retryPartnerName"]');
    args.onRetry(input?.value ?? args.partnerName);
  });
  panel.querySelector('[data-action="reward"]')?.addEventListener("click", args.onReward);

  setHud(panel);
}
