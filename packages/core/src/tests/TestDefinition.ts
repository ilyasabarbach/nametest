export type PromptInput =
  | { type: "name"; id: string; label: string; placeholder: string; maxLength: number }
  | { type: "choice"; id: string; label: string; options: string[] };

export type TestInputMode = "single-name" | "pair-name" | "tap-photo" | "selfie-optional";

export type RemixMode = "poster" | "portrait" | "headline" | "storybook" | "badge";

export type ViralHook = {
  curiosity: string;
  egoAxis: "identity" | "status" | "chemistry" | "future" | "mystery";
  artifactType: "poster" | "portrait" | "headline-card" | "storybook-cover" | "badge";
  shareAngle: string;
};

export type ResultBand = {
  key: string;
  minScore: number;
  maxScore: number;
  titleKey: string;
  descriptionKey: string;
  accent: string;
};

export type ResultVariant = {
  key: string;
  insightKey: string;
  aura: "soft" | "bold" | "electric" | "lucky";
  resultKeys?: string[];
};

export type TestDefinition = {
  id: string;
  category: "compatibility" | "personality" | "future";
  enabled: boolean;
  featured: boolean;
  unlockAfterSessions?: number;
  titleKey: string;
  subtitleKey: string;
  inputMode?: TestInputMode;
  artifactRecipeId?: string;
  imageRecipeId?: string;
  thumbnailRecipeId?: string;
  styleFamily?: string;
  viralHook?: ViralHook;
  seasonalTags?: string[];
  remixModes?: RemixMode[];
  safetyProfile?: "general" | "romance" | "identity" | "photo";
  prompts: PromptInput[];
  scoringFormula: string;
  resultBands: ResultBand[];
  resultVariants: ResultVariant[];
  shareTemplateKey: string;
  art: {
    cardGradient: [string, string];
    symbol: string;
  };
};
