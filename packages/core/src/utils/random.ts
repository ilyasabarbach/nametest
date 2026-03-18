export function seededIndex(seed: string, length: number): number {
  let total = 0;
  for (const char of seed) {
    total += char.charCodeAt(0);
  }

  return length === 0 ? 0 : total % length;
}
