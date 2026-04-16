export interface PlatformLifecycleHooks {
  pauseGame(): void;
  resumeGame(): void;
  navigateBack(): void;
  canNavigateBack(): boolean;
  navigateHome(): void;
  canExitApp(): boolean;
  toggleSettings(): void;
}

export type PlatformId = "browser" | "android" | "facebook" | "telegram";

export type PlatformLaunchSource = "profile" | "menu" | "direct" | "attachment" | "inline" | "keyboard" | "unknown";

export type PlatformLaunchContext = {
  source: PlatformLaunchSource;
  startParam?: string;
  initDataRaw?: string;
  platform?: string;
  isNativeShell?: boolean;
};

export type PlatformTheme = {
  colorScheme: "light" | "dark";
  colors?: Record<string, string>;
};

export type PlatformViewport = {
  height: number;
  stableHeight?: number;
  isExpanded?: boolean;
};

export interface IPlatform {
  readonly id: PlatformId;
  isOnline(): boolean;
  vibrate(milliseconds: number): void;
  getLaunchContext?(): PlatformLaunchContext;
  getTheme?(): PlatformTheme | null;
  onThemeChange?(listener: (theme: PlatformTheme | null) => void): (() => void) | void;
  getViewport?(): PlatformViewport | null;
  onViewportChange?(listener: (viewport: PlatformViewport | null) => void): (() => void) | void;
  updateNavigationChrome?(options: { showBack: boolean; showSettings: boolean }): void;
  setClosingConfirmation?(enabled: boolean): void;
  expand?(): void;
  requestFullscreen?(): Promise<void> | void;
  installLifecycle?(hooks: PlatformLifecycleHooks): Promise<(() => void) | void> | (() => void) | void;
  requestInvoicePayment?(invoiceUrl: string): Promise<boolean>;
}
