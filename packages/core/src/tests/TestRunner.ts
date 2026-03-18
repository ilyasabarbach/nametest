import type { TestDefinition } from "./TestDefinition";
import { chaosFormula } from "./formulas/chaosFormula";
import { compatibilityFormula } from "./formulas/compatibilityFormula";
import { futureFormula } from "./formulas/futureFormula";
import { spotlightFormula } from "./formulas/spotlightFormula";

export type TestInputValue = string | string[];

export type TestRunInput = {
  testId: string;
  values: Record<string, TestInputValue>;
};

export type TestRunResult = {
  testId: string;
  score: number;
  resultKey: string;
  resultTitleKey: string;
  resultDescriptionKey: string;
  accent: string;
};

const formulas: Record<string, (left: string, right: string) => number> = {
  compatibilityFormula,
  chaosFormula,
  futureFormula,
  spotlightFormula
};

export class TestRunner {
  run(definition: TestDefinition, input: TestRunInput): TestRunResult {
    const formula = formulas[definition.scoringFormula];
    if (!formula) {
      throw new Error(`Unknown scoring formula: ${definition.scoringFormula}`);
    }

    const first = String(input.values.primaryName ?? "");
    const second = String(input.values.partnerName ?? "");
    const score = formula(first, second);
    const band =
      definition.resultBands.find((candidate) => score >= candidate.minScore && score <= candidate.maxScore) ??
      definition.resultBands[definition.resultBands.length - 1];

    return {
      testId: definition.id,
      score,
      resultKey: band.key,
      resultTitleKey: band.titleKey,
      resultDescriptionKey: band.descriptionKey,
      accent: band.accent
    };
  }
}
