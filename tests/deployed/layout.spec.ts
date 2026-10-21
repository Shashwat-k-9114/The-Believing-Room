import { expect, test } from "@playwright/test";

for (const p of ["/", "/partners", "/sponsors", "/events", "/the-show", "/podcast", "/stories", "/register/candidate", "/faq"]) {
  test(`no horizontal overflow on a phone: ${p}`, async ({ page }) => {
    await page.goto(p);
    await page.waitForLoadState("networkidle");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
}
