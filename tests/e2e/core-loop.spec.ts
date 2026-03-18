import { test, expect } from "@playwright/test";

test("player can complete the core loop", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[name="primaryName"]').fill("Ilyas");
  await page.locator('input[name="partnerName"]').fill("Maya");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("text=Reading the stars")).toBeVisible();
});
