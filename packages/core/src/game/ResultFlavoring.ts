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
  const index = seededIndex(
    `${definition.id}:${result.score}:${result.resultKey}:${names.primaryName}:${names.partnerName}`,
    definition.resultVariants.length
  );
  const variant = definition.resultVariants[index] ?? definition.resultVariants[0];
  const signature = `${variant.aura.toUpperCase()}-${result.score}`;

  return {
    variant,
    signature
  };
}
