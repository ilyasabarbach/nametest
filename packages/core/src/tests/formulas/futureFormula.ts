export function futureFormula(leftName: string, rightName: string): number {
  const left = leftName.trim().toLowerCase();
  const right = rightName.trim().toLowerCase();
  const merged = `${left}${right}`;
  let score = 28;

  for (const [index, char] of Array.from(merged).entries()) {
    score += ((char.charCodeAt(0) * 7) + index * 5) % 19;
  }

  if (left.slice(-1) === right.slice(-1) && left.length > 0) {
    score += 14;
  }

  if (new Set(Array.from(merged)).size < merged.length * 0.8) {
    score += 7;
  }

  return Math.max(1, Math.min(100, score % 101));
}
