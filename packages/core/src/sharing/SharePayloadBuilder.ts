import type { TestDefinition } from "../tests/TestDefinition";
import type { TestRunResult } from "../tests/TestRunner";
import { getResultFlavor } from "../game/ResultFlavoring";

const templates: Record<string, string> = {
  "share.compatibility.default": "{primaryName} + {partnerName} scored {score}% in Cosmic Match. Aura: {aura}. Signature: {signature}."
};

export function buildSharePayload(
  definition: TestDefinition,
  result: TestRunResult,
  names: { primaryName: string; partnerName: string }
): string {
  const template = templates[definition.shareTemplateKey] ?? "{primaryName} scored {score}%!";
  const flavor = getResultFlavor(definition, result, names);

  return template
    .replace("{primaryName}", names.primaryName)
    .replace("{partnerName}", names.partnerName)
    .replace("{score}", String(result.score))
    .replace("{aura}", flavor.variant.aura)
    .replace("{signature}", flavor.signature);
}
