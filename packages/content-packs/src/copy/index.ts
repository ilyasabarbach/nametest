import commonAr from "./ar/common.json";
import resultsAr from "./ar/results.json";
import testsAr from "./ar/tests.json";
import commonDe from "./de/common.json";
import resultsDe from "./de/results.json";
import testsDe from "./de/tests.json";
import commonEn from "./en/common.json";
import resultsEn from "./en/results.json";
import testsEn from "./en/tests.json";
import commonEs from "./es/common.json";
import resultsEs from "./es/results.json";
import testsEs from "./es/tests.json";
import commonFr from "./fr/common.json";
import resultsFr from "./fr/results.json";
import testsFr from "./fr/tests.json";
import commonPt from "./pt/common.json";
import resultsPt from "./pt/results.json";
import testsPt from "./pt/tests.json";
import type { HomeFeedLocale } from "../discovery/homeFeed";

export const copyByLocale: Record<HomeFeedLocale, Record<string, string>> = {
  en: { ...commonEn, ...testsEn, ...resultsEn },
  fr: { ...commonFr, ...testsFr, ...resultsFr },
  es: { ...commonEs, ...testsEs, ...resultsEs },
  de: { ...commonDe, ...testsDe, ...resultsDe },
  ar: { ...commonAr, ...testsAr, ...resultsAr },
  pt: { ...commonPt, ...testsPt, ...resultsPt }
};

export function resolveCopyForLocale(locale: HomeFeedLocale): Record<string, string> {
  return copyByLocale[locale] ?? copyByLocale.en;
}
