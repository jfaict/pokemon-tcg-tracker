import { test, expect } from "@playwright/test";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;

test.describe("add copy failure", () => {
  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error("AUTH_PASSPHRASE env var is required for E2E tests");
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test("POST /api/copies 500 → 'Couldn't save. Try again.' inline, Save re-enabled, form stays open", async ({
    page,
  }) => {
    // Return a known 0-copy card from search so the test is deterministic
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              card: {
                id: "sv1-1",
                name: "TestCard",
                set: { name: "SV01" },
                number: "001/200",
              },
              copies: [],
              copyCount: 0,
            },
          ],
        }),
      });
    });

    // Mock POST /api/copies to simulate a server error
    await page.route("**/api/copies", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 500 });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("searchbox").fill("TestCard");

    const result = page.getByTestId("card-result").first();
    await expect(result).toBeVisible({ timeout: 2000 });

    await result.getByRole("button", { name: "Add to collection" }).click();

    // Fill both required fields so Save is enabled
    await result.getByLabel("Condition").selectOption("NM");
    await result.getByLabel("Location").fill("Binder 1");

    const saveButton = result.getByRole("button", { name: /^Save/ });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // REQ 4.4: inline error visible in the form
    await expect(result.getByText("Couldn't save. Try again.")).toBeVisible({
      timeout: 2000,
    });

    // Save button must be re-enabled (no false disable/success)
    await expect(saveButton).toBeEnabled();

    // Form stays open — location input still visible
    await expect(result.getByLabel("Location")).toBeVisible();
  });
});
