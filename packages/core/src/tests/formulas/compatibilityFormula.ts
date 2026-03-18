const vowelBoost = new Set(["a", "e", "i", "o", "u", "y"]);

export function compatibilityFormula(leftName: string, rightName: string): number {
  const combined = `${leftName}${rightName}`.trim().toLowerCase();
  if (!combined) {
    return 50;
  }

  let score = 37;
  for (const [index, char] of Array.from(combined).entries()) {
    const charCode = char.charCodeAt(0);
    score += (charCode * (index + 3)) % 17;
    if (vowelBoost.has(char)) {
      score += 4;
    }
  }

  if (leftName[0]?.toLowerCase() === rightName[0]?.toLowerCase()) {
    score += 9;
  }

  return Math.max(1, Math.min(100, score % 101));
}
