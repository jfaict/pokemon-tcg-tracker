import { test, expect } from "@playwright/test";
import { createClient } from "@libsql/client";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;
const PIKACHU_CARD_ID = "basep-1"; // Pikachu, Base Set Promo — first result for "Pikachu" search
const TEST_COPY_ID = "e2e-copy-details-pikachu-001";

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

test.describe("copy details inline", () => {
  test.beforeAll(async () => {
    const db = getDb();
    await db.execute({
      sql: "DELETE FROM copies WHERE id = ?",
      args: [TEST_COPY_ID],
    });
    await db.execute({
      sql: "INSERT INTO copies (id, card_id, condition, location, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [
        TEST_COPY_ID,
        PIKACHU_CARD_ID,
        "NM",
        "Binder 1",
        new Date().toISOString(),
      ],
    });
  });

  test.afterAll(async () => {
    const db = getDb();
    await db.execute({
      sql: "DELETE FROM copies WHERE id = ?",
      args: [TEST_COPY_ID],
    });
  });

  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error(
        "AUTH_PASSPHRASE env var is required for E2E tests"
      );
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test(
    "seeded Pikachu copy: count '1', condition, and location visible inline without navigation",
    async ({ page }) => {
      await page.getByRole("searchbox").fill("Pikachu");

      // REQ 1.1: results visible within 3 s
      await expect(page.getByTestId("card-result").first()).toBeVisible({
        timeout: 3000,
      });

      // REQ 2.1 + 2.2: find the result showing copy count "1"
      const ownedResult = page.getByTestId("card-result").filter({
        has: page.locator('[data-testid="copy-count"]').filter({ hasText: "1" }),
      });
      await expect(ownedResult.getByTestId("copy-count")).toHaveText("1");

      // REQ 2.3: condition and location visible inline — no navigation
      const copyRow = ownedResult.getByTestId("copy-row").first();
      await expect(copyRow).toBeVisible();
      await expect(copyRow).toContainText("NM");
      await expect(copyRow).toContainText("Binder 1");

      // REQ 3.2: still on the search screen
      await expect(page).toHaveURL("/");

      await page.screenshot({
        path: "e2e/screenshots/card-search/copy-details.png",
        fullPage: false,
      });
    }
  );
});
