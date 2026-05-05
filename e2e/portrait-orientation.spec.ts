import { test, expect } from "@playwright/test";

const PASSPHRASE = process.env.AUTH_PASSPHRASE;

async function login(page: import("@playwright/test").Page) {
  if (!PASSPHRASE) throw new Error("AUTH_PASSPHRASE env var is required");
  await page.goto("/login");
  await page.getByLabel("Passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
}

function assertWithinViewport(bb: { x: number; width: number } | null, viewportWidth: number, label: string) {
  expect(bb, `${label} bounding box should not be null`).not.toBeNull();
  expect(bb!.x, `${label} should not overflow left edge`).toBeGreaterThanOrEqual(0);
  expect(bb!.x + bb!.width, `${label} should not overflow right edge`).toBeLessThanOrEqual(viewportWidth);
}

test.describe("REQ 3.4 — portrait orientation: 375×812", () => {
  test("no horizontal scrollbar on login screen; passphrase input and sign-in button within viewport", async ({ page }) => {
    if (!PASSPHRASE) throw new Error("AUTH_PASSPHRASE env var is required");
    await page.goto("/login");

    const viewportWidth = page.viewportSize()!.width;

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, "no horizontal scroll on /login").toBe(false);

    const passphraseBB = await page.getByLabel("Passphrase").boundingBox();
    assertWithinViewport(passphraseBB, viewportWidth, "Passphrase input");

    const signInBB = await page.getByRole("button", { name: "Sign in" }).boundingBox();
    assertWithinViewport(signInBB, viewportWidth, "Sign-in button");
  });

  test("no horizontal scrollbar on home screen; search input within viewport", async ({ page }) => {
    await login(page);

    const viewportWidth = page.viewportSize()!.width;

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, "no horizontal scroll on /").toBe(false);

    const searchBB = await page.getByRole("searchbox").boundingBox();
    assertWithinViewport(searchBB, viewportWidth, "Search input");
  });

  test("no horizontal scrollbar with results; Add button and form controls within viewport", async ({ page }) => {
    await login(page);

    await page.route("**/api/search*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              card: {
                id: "sv3pt5-25",
                name: "Pikachu",
                set: { name: "151" },
                number: "025/165",
              },
              copies: [],
              copyCount: 0,
            },
          ],
        }),
      });
    });

    await page.getByRole("searchbox").fill("Pikachu");
    await expect(page.getByTestId("card-result").first()).toBeVisible({ timeout: 3000 });

    const viewportWidth = page.viewportSize()!.width;

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, "no horizontal scroll with results").toBe(false);

    const addButton = page.getByRole("button", { name: "Add to collection" });
    await expect(addButton).toBeVisible();
    const addBB = await addButton.boundingBox();
    assertWithinViewport(addBB, viewportWidth, "Add to collection button");

    // Open add form and check form controls
    await addButton.click();

    const condBB = await page.getByLabel("Condition").boundingBox();
    assertWithinViewport(condBB, viewportWidth, "Condition select");

    const locBB = await page.getByLabel("Location").boundingBox();
    assertWithinViewport(locBB, viewportWidth, "Location input");

    const saveBB = await page.getByRole("button", { name: /^Save/ }).boundingBox();
    assertWithinViewport(saveBB, viewportWidth, "Save button");
  });
});
