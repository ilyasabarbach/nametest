export type FeatureFlags = {
  adsEnabled: boolean;
  shareEnabled: boolean;
  hiddenTestsEnabled: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  adsEnabled: true,
  shareEnabled: true,
  hiddenTestsEnabled: false
};
