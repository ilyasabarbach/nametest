import type { TestDefinition } from "../tests/TestDefinition";
import type { TestRunResult } from "../tests/TestRunner";
import { getResultFlavor } from "../game/ResultFlavoring";

const templates: Record<string, string> = {
  "share.compatibility.default": "{primaryName} + {partnerName} scored {score}% in Cosmic Match. Aura: {aura}. Signature: {signature}."
};

export function buildSharePayload(
  definition: TestDefinition,
  result: TestRunResult,
  names: { primaryName: string; partnerName: string },
  copy?: Record<string, string>
): string {
  const testLabel = copy?.[definition.titleKey] ?? definition.id;
  const hasPartner = names.partnerName.trim().length > 0;
  const hasPrimary = names.primaryName.trim().length > 0;
  const template =
    copy
      ? hasPartner
        ? "{primaryName} + {partnerName} got {title} at {score}% in Cosmic Match. {hook} {sharePrompt}"
        : hasPrimary
          ? "{primaryName} got {title} at {score}% in Cosmic Match. {hook} {sharePrompt}"
          : "I got {title} at {score}% in {testLabel}. {hook} {sharePrompt}"
      : hasPartner
        ? templates[definition.shareTemplateKey] ?? "{primaryName} scored {score}%!"
        : hasPrimary
          ? "{primaryName} scored {score}%!"
          : "{title} scored {score}%!";
  const flavor = getResultFlavor(definition, result, names);
  const title = copy?.[result.resultTitleKey] ?? result.resultTitleKey;
  const hook = copy?.[`result.hook.${flavor.variant.aura}`] ?? flavor.variant.aura;
  const sharePrompt =
    copy?.[
      result.score >= 80 ? "result.sharePrompt.high" : result.score >= 55 ? "result.sharePrompt.mid" : "result.sharePrompt.low"
    ] ?? "This one is built for screenshots.";

  return template
    .replace("{primaryName}", names.primaryName)
    .replace("{partnerName}", names.partnerName)
    .replace("{title}", title)
    .replace("{testLabel}", testLabel)
    .replace("{score}", String(result.score))
    .replace("{aura}", flavor.variant.aura)
    .replace("{signature}", flavor.signature)
    .replace("{hook}", hook)
    .replace("{sharePrompt}", sharePrompt);
}
