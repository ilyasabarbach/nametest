type TelegramHapticFeedback = {
  impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  notificationOccurred?: (type: "error" | "success" | "warning") => void;
};

function getHaptics(): TelegramHapticFeedback | null {
  return ((window as any).Telegram?.WebApp?.HapticFeedback as TelegramHapticFeedback | undefined) ?? null;
}

export function triggerLightImpact(): void {
  getHaptics()?.impactOccurred?.("light");
}

export function triggerSuccessNotification(): void {
  getHaptics()?.notificationOccurred?.("success");
}

export function triggerErrorNotification(): void {
  getHaptics()?.notificationOccurred?.("error");
}
