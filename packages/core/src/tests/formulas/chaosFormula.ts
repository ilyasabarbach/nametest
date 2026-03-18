const consonants = new Set("bcdfghjklmnpqrstvwxyz".split(""));

export function chaosFormula(leftName: string, rightName: string): number {
  const combined = `${leftName}-${rightName}`.toLowerCase();
  let score = 19;

  for (const [index, char] of Array.from(combined).entries()) {
    score += ((char.charCodeAt(0) + index * 11) % 23);
    if (consonants.has(char)) {
      score += 3;
    }
  }

  if (Math.abs(leftName.length - rightName.length) <= 1) {
    score += 12;
  }

  return Math.max(1, Math.min(100, score % 101));
}
