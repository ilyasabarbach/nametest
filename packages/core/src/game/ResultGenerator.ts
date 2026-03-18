import type { SessionState } from "./SessionState";
import { getResultFlavor } from "./ResultFlavoring";

export type ResultCard = {
  headline: string;
  body: string;
  score: string;
  accent: string;
  insight: string;
  signature: string;
};

export function generateResultCard(
  state: SessionState,
  copy: Record<string, string>
): ResultCard {
  if (!state.latestResult) {
    throw new Error("Cannot generate result card before a test run completes.");
  }
  const flavor = getResultFlavor(state.selectedTest, state.latestResult, state.names);

  return {
    headline: copy[state.latestResult.resultTitleKey] ?? state.latestResult.resultTitleKey,
    body: copy[state.latestResult.resultDescriptionKey] ?? state.latestResult.resultDescriptionKey,
    score: `${state.latestResult.score}%`,
    accent: state.latestResult.accent,
    insight: copy[flavor.variant.insightKey] ?? flavor.variant.insightKey,
    signature: flavor.signature
  };
}
