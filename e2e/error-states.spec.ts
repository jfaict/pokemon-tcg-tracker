import { test, expect } from "@playwright/test";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;

function makeResults(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    card: {
      id: `sv1-${i + 1}`,
      name: `Card ${i + 1}`,
      set: { name: "Set Name" },
      number: `${String(i + 1).padStart(3, "0")}/200`,
    },
    copies: [],
    copyCount: 0,
  }));
}

test.describe("error states", () => {
  test.beforeEach(async ({ page }) => {
    if (!PASSPHRASE) {
      throw new Error("AUTH_PASSPHRASE env var is required for E2E tests");
    }
    await page.goto("/login");
    await page.getByLabel("Passphrase").fill(PASSPHRASE);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
  });

  test("(a) unknown query → 'No cards found for …' message, no blank screen", async ({
    page,
  }) => {
    const query = "xyznonexistentcard12345";
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await page.getByRole("searchbox").fill(query);

    // REQ 1.5: distinct "no cards found" message that includes the query, not a blank screen
    await expect(
      page.getByText(new RegExp(`No cards found for .?${query}.?`, "i"))
    ).toBeVisible({ timeout: 2000 });
  });

  test("(b) pokemontcg.io 500 → 'Search is unavailable. Try again.' banner + retry button", async ({
    page,
  }) => {
    // API route returns 502 when pokemontcg.io is unreachable
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({ status: 502 });
    });

    await page.getByRole("searchbox").fill("Pikachu");

    // REQ 3.6: human-readable error + retry action
    await expect(
      page.getByText("Search is unavailable. Try again.")
    ).toBeVisible({ timeout: 2000 });
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });

  test("(c) Turso read fail → 'Couldn't load your collection. Try again.' — distinct from zero-copy", async ({
    page,
  }) => {
    // API route returns 500 when Turso read fails
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.getByRole("searchbox").fill("Pikachu");

    // REQ 2.5: distinct error message, not a zero-copy result that looks like "not owned"
    await expect(
      page.getByText("Couldn't load your collection. Try again.")
    ).toBeVisible({ timeout: 2000 });
    // Must NOT render any card result (which would imply zero-copy = not owned)
    await expect(page.getByTestId("card-result")).not.toBeVisible();
  });

  test("(d) rate limit → 'Too many searches — wait a moment and try again' message", async ({
    page,
  }) => {
    // API route returns 429 when per-session rate limit is exceeded
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({ status: 429 });
    });

    await page.getByRole("searchbox").fill("Pikachu");

    // REQ 1.7 (rate limit): human-readable message, not blank
    await expect(
      page.getByText("Too many searches — wait a moment and try again")
    ).toBeVisible({ timeout: 2000 });
  });

  test("(e) exactly 20 results → 'Refine your search to see more' prompt visible", async ({
    page,
  }) => {
    await page.route("**/api/search*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: makeResults(20) }),
      });
    });

    await page.getByRole("searchbox").fill("Fire");

    // REQ 1.7: when results.length === 20 the UI shows a refine prompt
    await expect(page.getByTestId("card-result").first()).toBeVisible({
      timeout: 2000,
    });
    await expect(
      page.getByText("Refine your search to see more")
    ).toBeVisible({ timeout: 2000 });
  });
});
