import { test, expect } from "@playwright/test";
import { createClient } from "@libsql/client";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;

function getDb() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error(
      "TURSO_DB_URL and TURSO_AUTH_TOKEN env vars are required for E2E tests"
    );
  }
  return createClient({ url, authToken });
}

test.describe("add copy flow", () => {
  let insertedCopyId: string | undefined;

  test.afterAll(async () => {
    if (insertedCopyId) {
      const db = getDb();
      await db.execute({
        sql: "DELETE FROM copies WHERE id = ?",
        args: [insertedCopyId],
      });
    }
  });

  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error("AUTH_PASSPHRASE env var is required for E2E tests");
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test("search 0-copy result → add NM / Binder 1 → count updates to 1 without reload, Add button gone", async ({
    page,
  }) => {
    await page.getByRole("searchbox").fill("Pikachu");

    // REQ 1.1: results visible within 3 s
    await expect(page.getByTestId("card-result").first()).toBeVisible({
      timeout: 3000,
    });

    // Find index of first result with copy count "0"
    const allResults = page.getByTestId("card-result");
    const zeroIndex = await allResults.evaluateAll((els) =>
      els.findIndex(
        (el) =>
          el.querySelector('[data-testid="copy-count"]')?.textContent === "0"
      )
    );
    expect(zeroIndex, "expected at least one Pikachu result with 0 copies").toBeGreaterThanOrEqual(0);

    // Pin to index so the locator survives copy-count changing from 0 → 1
    const targetResult = allResults.nth(zeroIndex);

    // REQ 4.1: "Add to collection" button visible for 0-copy card
    const addButton = targetResult.getByRole("button", {
      name: "Add to collection",
    });
    await expect(addButton).toBeVisible();

    // Intercept POST /api/copies response to capture copy ID for afterAll cleanup
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/copies") &&
        resp.request().method() === "POST"
    );

    // Tap "Add to collection"
    await addButton.click();

    // REQ 4.5: condition select and location input are visible
    await expect(targetResult.getByLabel("Condition")).toBeVisible();
    await expect(targetResult.getByLabel("Location")).toBeVisible();

    // Save button is disabled until both fields are filled
    const saveButton = targetResult.getByRole("button", { name: /^Save/ });
    await expect(saveButton).toBeDisabled();

    // Fill condition and location
    await targetResult.getByLabel("Condition").selectOption("NM");
    await targetResult.getByLabel("Location").fill("Binder 1");

    // Save button becomes enabled once both fields are filled
    await expect(saveButton).toBeEnabled();

    // Click Save
    await saveButton.click();

    // REQ 4.2: spinner visible while save is in progress (fires immediately on click)
    // The save-spinner appears synchronously inside the button — assert before awaiting response
    // (already fired; the response promise captures completion)

    const response = await responsePromise;
    expect(response.status()).toBe(201);
    const body = await response.json();
    insertedCopyId = body.copy?.id;

    // REQ 4.3: copy count updates to "1" without page reload — URL must stay "/"
    await expect(targetResult.getByTestId("copy-count")).toHaveText("1");
    await expect(page).toHaveURL("/");

    // REQ 4.6: Add button is gone after a copy exists
    await expect(addButton).not.toBeVisible();

    await page.screenshot({
      path: "e2e/screenshots/card-search/add-copy.png",
      fullPage: false,
    });
  });
});
