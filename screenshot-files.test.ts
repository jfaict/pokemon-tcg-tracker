import { existsSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const screenshotDir = resolve(__dirname, "e2e/screenshots/card-search");

describe("user-docs screenshots", () => {
  it("(a) copy-details.png exists — owned card with copy details visible", () => {
    expect(existsSync(resolve(screenshotDir, "copy-details.png"))).toBe(true);
  });

  it("(b) add-button.png exists — unowned card with Add to collection button", () => {
    expect(existsSync(resolve(screenshotDir, "add-button.png"))).toBe(true);
  });

  it("(c) add-form.png exists — add form open with fields", () => {
    expect(existsSync(resolve(screenshotDir, "add-form.png"))).toBe(true);
  });

  it("(d) add-copy.png exists — after save with copy count updated", () => {
    expect(existsSync(resolve(screenshotDir, "add-copy.png"))).toBe(true);
  });
});
