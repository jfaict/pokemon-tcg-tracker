import { test, expect } from "@playwright/test";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;

test.describe("search happy path", () => {
  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error("AUTH_PASSPHRASE env var is required for E2E tests");
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test("empty query: search input is primary element and prompt is visible", async ({
    page,
  }) => {
    // REQ 3.1: search input is the primary element on the initial screen
    await expect(page.getByRole("searchbox")).toBeVisible();
    // REQ 1.4: empty query shows prompt, not results
    await expect(page.getByText("Type a card name to search")).toBeVisible();
  });

  test("Pikachu search: loading indicator appears then results show name, set, and collector number within 3 s", async ({
    page,
  }) => {
    await page.getByRole("searchbox").fill("Pikachu");

    // REQ 3.5: loading indicator visible within 300 ms of debounce firing
    await expect(page.getByRole("status")).toBeVisible({ timeout: 600 });

    // REQ 1.1: results visible within 3 s of keystroke pause
    const firstResult = page.getByTestId("card-result").first();
    await expect(firstResult).toBeVisible({ timeout: 3000 });

    // REQ 1.3: partial case-insensitive match — name should contain "Pikachu"
    await expect(firstResult.getByTestId("card-name")).toContainText("Pikachu", {
      ignoreCase: true,
    });
    // REQ 1.6: set name and collector number present
    await expect(firstResult.getByTestId("card-set")).not.toBeEmpty();
    await expect(firstResult.getByTestId("card-number")).not.toBeEmpty();
  });
});
