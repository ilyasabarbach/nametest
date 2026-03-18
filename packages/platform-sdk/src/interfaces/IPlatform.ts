export interface PlatformLifecycleHooks {
  pauseGame(): void;
  resumeGame(): void;
  navigateHome(): void;
  canExitApp(): boolean;
}

export interface IPlatform {
  readonly id: "browser" | "android" | "facebook";
  isOnline(): boolean;
  vibrate(milliseconds: number): void;
  installLifecycle?(hooks: PlatformLifecycleHooks): Promise<(() => void) | void> | (() => void) | void;
}
