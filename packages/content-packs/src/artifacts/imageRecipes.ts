export type GeneratedImageRecipe = {
  id: string;
  kind: "result-poster" | "feed-thumbnail";
  styleFamily: string;
  promptStrategy:
    | "past-life-vintage"
    | "aura-portrait"
    | "headline-tabloid"
    | "touch-reveal"
    | "duo-romance"
    | "movie-poster"
    | "group-badge"
    | "storybook-cover"
    | "future-oracle";
  aspectRatio: "portrait" | "landscape" | "square";
  cloudflareModel?: string;
  notes: string;
};

export const generatedImageRecipes: GeneratedImageRecipe[] = [
  {
    id: "past-life-vintage-poster",
    kind: "result-poster",
    styleFamily: "vintage-past-life",
    promptStrategy: "past-life-vintage",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Sepia editorial poster with vintage framing and a mythic biography feel."
  },
  {
    id: "vintage-portrait-thumb",
    kind: "feed-thumbnail",
    styleFamily: "vintage-past-life",
    promptStrategy: "past-life-vintage",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Vintage human-photo-led thumbnail for past-life and mystery stories."
  },
  {
    id: "aura-portrait-thumb",
    kind: "feed-thumbnail",
    styleFamily: "aura-portrait",
    promptStrategy: "aura-portrait",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Glow-led identity portrait thumbnail for aura and hidden-gift stories."
  },
  {
    id: "headline-tabloid-thumb",
    kind: "feed-thumbnail",
    styleFamily: "headline-tabloid",
    promptStrategy: "headline-tabloid",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Bold headline or tabloid-style thumbnail with fast social-promo energy."
  },
  {
    id: "touch-reveal-thumb",
    kind: "feed-thumbnail",
    styleFamily: "touch-reveal",
    promptStrategy: "touch-reveal",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Tap-to-reveal thumbnail with a strong hand cue and hidden-image tease."
  },
  {
    id: "duo-romance-thumb",
    kind: "feed-thumbnail",
    styleFamily: "duo-romance",
    promptStrategy: "duo-romance",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Attracting duo-poster thumbnail for relationship and chemistry tests."
  },
  {
    id: "future-oracle-thumb",
    kind: "feed-thumbnail",
    styleFamily: "future-oracle",
    promptStrategy: "future-oracle",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Editorial fortune-card thumbnail for future, destiny, and job tests."
  },
  {
    id: "group-badge-thumb",
    kind: "feed-thumbnail",
    styleFamily: "social-badge",
    promptStrategy: "group-badge",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Social-role thumbnail with strong label/badge energy."
  },
  {
    id: "storybook-cover-thumb",
    kind: "feed-thumbnail",
    styleFamily: "storybook-cover",
    promptStrategy: "storybook-cover",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Softly illustrated cover-like thumbnail for soul-story and biography-style tests."
  },
  {
    id: "movie-poster-thumb",
    kind: "feed-thumbnail",
    styleFamily: "movie-poster",
    promptStrategy: "movie-poster",
    aspectRatio: "portrait",
    cloudflareModel: "@cf/black-forest-labs/flux-1-schnell",
    notes: "Cinematic hero thumbnail for poster and dramatic-fate tests."
  }
];

export const generatedImageRecipesById = new Map(generatedImageRecipes.map((recipe) => [recipe.id, recipe]));
