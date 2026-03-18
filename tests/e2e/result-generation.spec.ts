import { test, expect } from "@playwright/test";

test("reward button appears after a successful reading", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[name="primaryName"]').fill("Ilyas");
  await page.locator('input[name="partnerName"]').fill("Nova");
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);
  await expect(page.locator("text=Unlock secret reading")).toBeVisible();
});
