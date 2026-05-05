import { describe, it, expect } from "vitest";
import { validateCopiesInput } from "./route";

describe("validateCopiesInput", () => {
  const valid = { cardId: "sv3pt5-25", condition: "NM", location: "Binder 1" };

  it("accepts a valid input", () => {
    expect(validateCopiesInput(valid)).toEqual(valid);
  });

  it("accepts a cardId at the max length of 32 chars", () => {
    const cardId = "a".repeat(16) + "-" + "b".repeat(15);
    expect(validateCopiesInput({ ...valid, cardId })).not.toBeNull();
  });

  it("rejects an empty cardId", () => {
    expect(validateCopiesInput({ ...valid, cardId: "" })).toBeNull();
  });

  it("rejects a cardId with path traversal characters like '../etc'", () => {
    expect(validateCopiesInput({ ...valid, cardId: "../etc" })).toBeNull();
  });

  it("rejects a cardId longer than 32 chars", () => {
    expect(validateCopiesInput({ ...valid, cardId: "a".repeat(17) + "-" + "b".repeat(16) })).toBeNull();
  });

  it("rejects a cardId that does not match the pattern (no hyphen)", () => {
    expect(validateCopiesInput({ ...valid, cardId: "sv3pt525" })).toBeNull();
  });

  it("rejects condition 'EX' which is not in the allowed set", () => {
    expect(validateCopiesInput({ ...valid, condition: "EX" })).toBeNull();
  });

  it("accepts condition 'NM'", () => {
    expect(validateCopiesInput({ ...valid, condition: "NM" })).not.toBeNull();
  });

  it("accepts condition 'LP'", () => {
    expect(validateCopiesInput({ ...valid, condition: "LP" })).not.toBeNull();
  });

  it("accepts condition 'MP'", () => {
    expect(validateCopiesInput({ ...valid, condition: "MP" })).not.toBeNull();
  });

  it("accepts condition 'HP'", () => {
    expect(validateCopiesInput({ ...valid, condition: "HP" })).not.toBeNull();
  });

  it("accepts condition 'DMG'", () => {
    expect(validateCopiesInput({ ...valid, condition: "DMG" })).not.toBeNull();
  });

  it("rejects an empty location", () => {
    expect(validateCopiesInput({ ...valid, location: "" })).toBeNull();
  });

  it("rejects a whitespace-only location", () => {
    expect(validateCopiesInput({ ...valid, location: "   " })).toBeNull();
  });

  it("accepts a location of exactly 100 characters", () => {
    expect(validateCopiesInput({ ...valid, location: "a".repeat(100) })).not.toBeNull();
  });

  it("rejects a location longer than 100 characters", () => {
    expect(validateCopiesInput({ ...valid, location: "a".repeat(101) })).toBeNull();
  });

  it("rejects input when cardId field is missing", () => {
    const { cardId: _, ...rest } = valid;
    expect(validateCopiesInput(rest)).toBeNull();
  });

  it("rejects input when condition field is missing", () => {
    const { condition: _, ...rest } = valid;
    expect(validateCopiesInput(rest)).toBeNull();
  });

  it("rejects input when location field is missing", () => {
    const { location: _, ...rest } = valid;
    expect(validateCopiesInput(rest)).toBeNull();
  });
});
