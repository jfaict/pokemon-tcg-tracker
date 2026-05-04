import { describe, it, expect } from "vitest";
import { validateQ, mergeResults } from "./route";

describe("validateQ", () => {
  it("accepts a valid card name", () => {
    expect(validateQ("Charizard")).toBe("Charizard");
  });

  it("accepts a name with spaces and hyphens", () => {
    expect(validateQ("Mr. Mime")).toBe("Mr. Mime");
  });

  it("trims leading and trailing whitespace before validating", () => {
    expect(validateQ("  Pikachu  ")).toBe("Pikachu");
  });

  it("rejects an empty string", () => {
    expect(validateQ("")).toBeNull();
  });

  it("rejects a whitespace-only string", () => {
    expect(validateQ("   ")).toBeNull();
  });

  it("rejects a string containing invalid characters like '<script>'", () => {
    expect(validateQ("<script>")).toBeNull();
  });

  it("rejects a string containing angle brackets", () => {
    expect(validateQ("Char<izard>")).toBeNull();
  });

  it("rejects a string longer than 100 characters", () => {
    expect(validateQ("a".repeat(101))).toBeNull();
  });

  it("accepts a string of exactly 100 characters", () => {
    const q = "a".repeat(100);
    expect(validateQ(q)).toBe(q);
  });
});

describe("mergeResults", () => {
  const card1 = { id: "sv3pt5-25", name: "Pikachu", set: { name: "151" }, number: "025/165" };
  const card2 = { id: "base1-4", name: "Charizard", set: { name: "Base Set" }, number: "4/102" };

  const copies = [
    { id: "copy-1", card_id: "sv3pt5-25", condition: "NM", location: "Binder 1", created_at: "2026-05-01T00:00:00Z" },
    { id: "copy-2", card_id: "sv3pt5-25", condition: "LP", location: "Binder 2", created_at: "2026-05-02T00:00:00Z" },
    { id: "copy-3", card_id: "base1-4", condition: "MP", location: "Box 1", created_at: "2026-05-03T00:00:00Z" },
  ];

  it("returns a result for each catalogue card", () => {
    const results = mergeResults([card1, card2], copies);
    expect(results).toHaveLength(2);
  });

  it("assigns the correct copyCount for a card with copies", () => {
    const results = mergeResults([card1, card2], copies);
    const pikachu = results.find((r) => r.card.id === "sv3pt5-25");
    expect(pikachu?.copyCount).toBe(2);
  });

  it("includes the correct copies array (without created_at) for a card", () => {
    const results = mergeResults([card1, card2], copies);
    const pikachu = results.find((r) => r.card.id === "sv3pt5-25");
    expect(pikachu?.copies).toHaveLength(2);
    expect(pikachu?.copies[0]).toEqual({ id: "copy-1", condition: "NM", location: "Binder 1" });
    expect(pikachu?.copies[1]).toEqual({ id: "copy-2", condition: "LP", location: "Binder 2" });
  });

  it("assigns copyCount 0 and empty copies array for an unowned card", () => {
    const results = mergeResults([card1, card2], []);
    const charizard = results.find((r) => r.card.id === "base1-4");
    expect(charizard?.copyCount).toBe(0);
    expect(charizard?.copies).toEqual([]);
  });

  it("does not cross-assign copies between different cards", () => {
    const results = mergeResults([card1, card2], copies);
    const charizard = results.find((r) => r.card.id === "base1-4");
    expect(charizard?.copyCount).toBe(1);
    expect(charizard?.copies[0]).toEqual({ id: "copy-3", condition: "MP", location: "Box 1" });
  });

  it("preserves the card data on each result", () => {
    const results = mergeResults([card1], copies);
    expect(results[0].card).toEqual(card1);
  });

  it("returns empty array when given no catalogue cards", () => {
    const results = mergeResults([], copies);
    expect(results).toEqual([]);
  });

  it("does not include created_at in the copies array", () => {
    const results = mergeResults([card1], copies);
    const pikachu = results.find((r) => r.card.id === "sv3pt5-25");
    pikachu?.copies.forEach((c) => {
      expect(c).not.toHaveProperty("created_at");
    });
  });
});
