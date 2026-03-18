import { describe, expect, it } from "vitest";
import { canUnlockAlternateResult, GameFlow, generateResultCard, defaultFeatureFlags, getUnlockedTests, createPlayerProgress } from "./index";
import type { TestDefinition } from "./tests/TestDefinition";

const definition: TestDefinition = {
  id: "love-match",
  category: "compatibility",
  enabled: true,
  featured: true,
  titleKey: "test.loveMatch.title",
  subtitleKey: "test.loveMatch.subtitle",
  prompts: [
    { type: "name", id: "primaryName", label: "You", placeholder: "Your name", maxLength: 20 },
    { type: "name", id: "partnerName", label: "Partner", placeholder: "Partner name", maxLength: 20 }
  ],
  scoringFormula: "compatibilityFormula",
  resultBands: [
    { key: "steady", minScore: 0, maxScore: 49, titleKey: "result.steady.title", descriptionKey: "result.steady.body", accent: "#6ea8ff" },
    { key: "spark", minScore: 50, maxScore: 100, titleKey: "result.spark.title", descriptionKey: "result.spark.body", accent: "#ff7a59" }
  ],
  resultVariants: [
    { key: "steady-soft", insightKey: "insight.steady.soft", aura: "soft" },
    { key: "spark-bold", insightKey: "insight.spark.electric", aura: "bold" }
  ],
  shareTemplateKey: "share.compatibility.default",
  art: { cardGradient: ["#101f3c", "#284a7a"], symbol: "star" }
};

describe("game flow", () => {
  it("runs the flagship test and generates a result card", () => {
    const flow = new GameFlow(defaultFeatureFlags);
    const session = flow.createSession(definition, "Ilyas", "Maya");
    const completed = flow.runSession(session, {
      testId: definition.id,
      values: {
        primaryName: "Ilyas",
        partnerName: "Maya"
      }
    }, [definition]);

    expect(completed.latestResult?.score).toBeGreaterThan(0);
    expect(
      generateResultCard(completed, {
        "result.steady.title": "Steady Orbit",
        "result.steady.body": "A calm match with room to grow.",
        "result.spark.title": "Meteor Spark",
        "result.spark.body": "Big chemistry and bold energy.",
        "insight.steady.soft": "Trust is the secret weapon here.",
        "insight.spark.electric": "You two create energy fast."
      }).headline
    ).toMatch(/Orbit|Spark/);
  });

  it("allows alternate result unlock only once", () => {
    expect(
      canUnlockAlternateResult(
        {
          testId: definition.id,
          score: 77,
          resultKey: "spark",
          resultTitleKey: "result.spark.title",
          resultDescriptionKey: "result.spark.body",
          accent: "#ff7a59"
        },
        { rewardedSeen: false, alternateResultUnlocked: false }
      )
    ).toBe(true);
  });

  it("unlocks gated tests after enough sessions", () => {
    const locked = {
      ...definition,
      id: "friendship-score",
      enabled: false,
      featured: false,
      unlockAfterSessions: 2
    };

    expect(getUnlockedTests([definition, locked], createPlayerProgress(), false)).toHaveLength(1);
    expect(getUnlockedTests([definition, locked], { ...createPlayerProgress(), sessionsPlayed: 2 }, false)).toHaveLength(2);
  });
});
