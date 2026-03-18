import type { TestDefinition, ResultVariant } from "../tests/TestDefinition";
import type { TestRunResult } from "../tests/TestRunner";
import { seededIndex } from "../utils/random";

export type ResultFlavor = {
  variant: ResultVariant;
  signature: string;
};

export function getResultFlavor(
  definition: TestDefinition,
  result: TestRunResult,
  names: { primaryName: string; partnerName: string }
): ResultFlavor {
  const matchingVariants = definition.resultVariants.filter((variant) =>
    !variant.resultKeys || variant.resultKeys.includes(result.resultKey)
  );
  const candidateVariants = matchingVariants.length > 0 ? matchingVariants : definition.resultVariants;
  const index = seededIndex(
    `${definition.id}:${result.score}:${result.resultKey}:${names.primaryName}:${names.partnerName}`,
    candidateVariants.length
  );
  const variant = candidateVariants[index] ?? candidateVariants[0];
  const signature = `${variant.aura.toUpperCase()}-${result.score}`;

  return {
    variant,
    signature
  };
}
