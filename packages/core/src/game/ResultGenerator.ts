import type { SessionState } from "./SessionState";
import { getResultFlavor } from "./ResultFlavoring";

export type ResultCard = {
  hook: string;
  headline: string;
  body: string;
  score: string;
  accent: string;
  insight: string;
  signature: string;
  sharePrompt: string;
};

export function generateResultCard(
  state: SessionState,
  copy: Record<string, string>
): ResultCard {
  if (!state.latestResult) {
    throw new Error("Cannot generate result card before a test run completes.");
  }
  const flavor = getResultFlavor(state.selectedTest, state.latestResult, state.names);
  const aura = flavor.variant.aura;
  const hookKey = `result.hook.${aura}`;
  const sharePromptKey =
    state.latestResult.score >= 80
      ? "result.sharePrompt.high"
      : state.latestResult.score >= 55
        ? "result.sharePrompt.mid"
        : "result.sharePrompt.low";

  return {
    hook: copy[hookKey] ?? aura.toUpperCase(),
    headline: copy[state.latestResult.resultTitleKey] ?? state.latestResult.resultTitleKey,
    body: copy[state.latestResult.resultDescriptionKey] ?? state.latestResult.resultDescriptionKey,
    score: `${state.latestResult.score}%`,
    accent: state.latestResult.accent,
    insight: copy[flavor.variant.insightKey] ?? flavor.variant.insightKey,
    signature: flavor.signature,
    sharePrompt: copy[sharePromptKey] ?? copy["result.sharePrompt.mid"] ?? "This one is built for screenshots."
  };
}
