import { setHud } from "../components/hud";

export function showHomeOverlay(args: {
  title: string;
  subtitle: string;
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
  tests: Array<{ id: string; label: string; selected: boolean; lockedLabel?: string | null }>;
  onSelectTest: (testId: string) => void;
  onSubmit: (primaryName: string, partnerName: string) => void;
}): void {
  const panel = document.createElement("form");
  panel.className = "hud-panel hud-panel--home hud-stack";

  panel.innerHTML = `
    <h1>${args.title}</h1>
    <p>${args.subtitle}</p>
    <p class="hud-label">${args.dailyLabel}</p>
    <p class="hud-label">${args.eventLabel}: ${args.eventTheme}</p>
    ${args.dailyRewardCoins > 0 ? `<p class="hud-label">Daily reward claimed: +${args.dailyRewardCoins}</p>` : ""}
    <div class="hud-pill-row hud-pill-row-wide">
      <div class="hud-pill"><strong>${args.streakValue}</strong><span>${args.streakLabel}</span></div>
      <div class="hud-pill"><strong>${args.sessionsValue}</strong><span>${args.sessionsLabel}</span></div>
      <div class="hud-pill"><strong>${args.rewardValue}</strong><span>${args.rewardsLabel}</span></div>
      <div class="hud-pill"><strong>${args.collectionValue}</strong><span>${args.collectionLabel}</span></div>
    </div>
    <div class="hud-test-grid">
      ${args.tests
        .map(
          (test) => `
            <button class="hud-test-tile ${test.selected ? "selected" : ""}" type="button" data-test-id="${test.id}" ${test.lockedLabel ? "disabled" : ""}>
              <span>${test.label}</span>
              <small>${test.lockedLabel ?? (test.selected ? "Selected" : "Tap to choose")}</small>
            </button>
          `
        )
        .join("")}
    </div>
    <label class="hud-stack">
      <span class="hud-label">${args.primaryLabel}</span>
      <input class="hud-input" name="primaryName" maxlength="20" autocomplete="off" />
    </label>
    <label class="hud-stack">
      <span class="hud-label">${args.partnerLabel}</span>
      <input class="hud-input" name="partnerName" maxlength="20" autocomplete="off" />
    </label>
    <button class="hud-button" type="submit">Start the reading</button>
  `;

  panel.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(panel);
    args.onSubmit(String(form.get("primaryName") ?? ""), String(form.get("partnerName") ?? ""));
  });

  panel.querySelectorAll<HTMLElement>("[data-test-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const testId = button.dataset.testId;
      if (testId) {
        args.onSelectTest(testId);
      }
    });
  });

  setHud(panel);
}
