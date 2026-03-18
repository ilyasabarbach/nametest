export type PromptInput =
  | { type: "name"; id: string; label: string; placeholder: string; maxLength: number }
  | { type: "choice"; id: string; label: string; options: string[] };

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
