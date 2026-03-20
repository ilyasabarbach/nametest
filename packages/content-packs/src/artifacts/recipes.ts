export type ArtifactRecipe = {
  id: string;
  engineMode: "template" | "ai-optional";
  output: "poster" | "portrait" | "headline-card" | "storybook-cover" | "badge";
  styleFamily: string;
  promptStrategy: "duo-poster" | "identity-portrait" | "headline-card" | "storybook-cover" | "badge-reveal";
  fallbackShareTemplateKey: string;
  notes: string;
};

export const artifactRecipes: ArtifactRecipe[] = [
  {
    id: "duo-cosmic-poster",
    engineMode: "template",
    output: "poster",
    styleFamily: "cosmic-romance",
    promptStrategy: "duo-poster",
    fallbackShareTemplateKey: "share.compatibility.default",
    notes: "Default pair-name result poster. Safe fallback for all chemistry-style tests."
  },
  {
    id: "duo-tabloid-poster",
    engineMode: "template",
    output: "poster",
    styleFamily: "tabloid-drama",
    promptStrategy: "duo-poster",
    fallbackShareTemplateKey: "share.compatibility.default",
    notes: "Higher-drama social poster for crush, fame, and chaos reads."
  },
  {
    id: "future-headline-card",
    engineMode: "template",
    output: "headline-card",
    styleFamily: "future-headline",
    promptStrategy: "headline-card",
    fallbackShareTemplateKey: "share.future.default",
    notes: "Text-first artifact optimized for future, destiny, and 2030-style outcomes."
  },
  {
    id: "identity-aura-portrait",
    engineMode: "ai-optional",
    output: "portrait",
    styleFamily: "aura-portrait",
    promptStrategy: "identity-portrait",
    fallbackShareTemplateKey: "share.compatibility.default",
    notes: "Optional AI portrait remix for aura and hidden-gift tests, with template fallback."
  },
  {
    id: "storybook-echo-cover",
    engineMode: "ai-optional",
    output: "storybook-cover",
    styleFamily: "storybook-echo",
    promptStrategy: "storybook-cover",
    fallbackShareTemplateKey: "share.compatibility.default",
    notes: "Optional storybook-style artifact for past-life and biography-flavored tests."
  },
  {
    id: "duo-badge-reveal",
    engineMode: "template",
    output: "badge",
    styleFamily: "social-badge",
    promptStrategy: "badge-reveal",
    fallbackShareTemplateKey: "share.compatibility.default",
    notes: "Fast, low-cost badge artifact for friendship and role-based duo tests."
  }
];

export const artifactRecipesById = new Map(artifactRecipes.map((recipe) => [recipe.id, recipe]));
