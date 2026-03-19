export interface PlatformLifecycleHooks {
  pauseGame(): void;
  resumeGame(): void;
  navigateBack(): void;
  canNavigateBack(): boolean;
  navigateHome(): void;
  canExitApp(): boolean;
}

export interface IPlatform {
  readonly id: "browser" | "android" | "facebook";
  isOnline(): boolean;
  vibrate(milliseconds: number): void;
  installLifecycle?(hooks: PlatformLifecycleHooks): Promise<(() => void) | void> | (() => void) | void;
}
