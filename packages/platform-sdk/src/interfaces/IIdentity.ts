export type SocialProfile = {
  provider: "google" | "telegram";
  id: string;
  displayName: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  imageUrl?: string;
};

export interface IIdentity {
  canUseGoogleProfile(): boolean;
  connectGoogleProfile(): Promise<SocialProfile | null>;
  disconnectGoogleProfile(): Promise<void>;
  getPlatformProfile(): Promise<SocialProfile | null>;
}
