import { test, expect } from "@playwright/test";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;
// 40 characters — exceeds the 30-char threshold in REQ 1.8
const LONG_CARD_NAME = "Mega Venusaur & Charizard & Blastoise-GX";

test.describe("layout: long card name at 375 px", () => {
  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error("AUTH_PASSPHRASE env var is required for E2E tests");
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test(
    "card name longer than 30 chars: no text-overflow ellipsis and no horizontal scroll",
    async ({ page }) => {
      // Mock /api/search to return a card whose name is >30 chars
      await page.route("**/api/search*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            results: [
              {
                card: {
                  id: "test-long-name-01",
                  name: LONG_CARD_NAME,
                  set: { name: "Cosmic Eclipse" },
                  number: "220/236",
                },
                copies: [],
                copyCount: 0,
              },
            ],
          }),
        });
      });

      await page.getByRole("searchbox").fill("Mega");

      // REQ 1.8: result with long name must be visible
      await expect(page.getByTestId("card-name")).toBeVisible({ timeout: 3000 });
      await expect(page.getByTestId("card-name")).toHaveText(LONG_CARD_NAME);

      // REQ 1.8: card name must not be clipped with text-overflow: ellipsis
      const textOverflow = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="card-name"]');
        if (!el) return null;
        return window.getComputedStyle(el).textOverflow;
      });
      expect(textOverflow).not.toBe("ellipsis");

      // REQ 1.8: no horizontal scroll at 375 px viewport width
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  );
});
