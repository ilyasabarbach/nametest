const root = () => document.getElementById("hud-root");

export function setHud(node: HTMLElement): void {
  const container = root();
  if (!container) {
    return;
  }

  container.replaceChildren(node);
}

export function clearHud(): void {
  root()?.replaceChildren();
}
