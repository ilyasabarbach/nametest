export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z\s'-]/g, "").trim().slice(0, 20);
}

export function isNameValid(value: string): boolean {
  return sanitizeName(value).length >= 2;
}
