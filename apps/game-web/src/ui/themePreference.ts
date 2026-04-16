export type ThemePreference = "auto" | "light" | "dark";

const STORAGE_KEY = "app.themePreference";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "auto" || value === "light" || value === "dark";
}

export function getThemePreference(): ThemePreference {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isThemePreference(raw) ? raw : "auto";
  } catch {
    return "auto";
  }
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Ignore localStorage failures in restricted contexts.
  }

  window.dispatchEvent(
    new CustomEvent("app:theme-preference", {
      detail: { preference }
    })
  );
}
