const spotlightLetters = new Set(["a", "e", "m", "n", "r", "s"]);

export function spotlightFormula(leftName: string, rightName: string): number {
  const merged = `${leftName}${rightName}`.toLowerCase();
  let score = 33;

  for (const [index, char] of Array.from(merged).entries()) {
    if (spotlightLetters.has(char)) {
      score += 6;
    }
    score += (char.charCodeAt(0) + index) % 13;
  }

  if (leftName[0]?.toLowerCase() !== rightName[0]?.toLowerCase()) {
    score += 8;
  }

  return Math.max(1, Math.min(100, score % 101));
}
