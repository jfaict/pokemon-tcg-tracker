import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardResult } from "./CardResult";

const baseCard = {
  id: "sv3pt5-25",
  name: "Pikachu",
  set: { name: "151" },
  number: "025/165",
};

const makeCopy = (i: number) => ({
  id: `copy-${i}`,
  condition: "NM" as const,
  location: `Binder ${i}`,
});

describe("CardResult", () => {
  it("renders name, set name, and collector number", () => {
    render(<CardResult card={baseCard} copies={[]} copyCount={0} />);
    expect(screen.getByText("Pikachu")).toBeDefined();
    expect(screen.getByText("151")).toBeDefined();
    expect(screen.getByText("025/165")).toBeDefined();
  });

  it("shows copy count as text '0' when copyCount is 0", () => {
    render(<CardResult card={baseCard} copies={[]} copyCount={0} />);
    expect(screen.getByTestId("copy-count").textContent).toBe("0");
  });

  it("shows 'Add to collection' button when copyCount is 0", () => {
    render(<CardResult card={baseCard} copies={[]} copyCount={0} />);
    expect(
      screen.getByRole("button", { name: /add to collection/i })
    ).toBeDefined();
  });

  it("shows no copy detail rows when copyCount is 0", () => {
    render(<CardResult card={baseCard} copies={[]} copyCount={0} />);
    expect(screen.queryAllByTestId("copy-row")).toHaveLength(0);
  });

  it("renders three copy rows with condition and location when copyCount is 3", () => {
    const copies = [makeCopy(1), makeCopy(2), makeCopy(3)];
    render(<CardResult card={baseCard} copies={copies} copyCount={3} />);
    const rows = screen.getAllByTestId("copy-row");
    expect(rows).toHaveLength(3);
    expect(screen.getAllByText("NM")).toHaveLength(3);
    expect(screen.getByText("Binder 1")).toBeDefined();
    expect(screen.getByText("Binder 2")).toBeDefined();
    expect(screen.getByText("Binder 3")).toBeDefined();
  });

  it("does not show 'Add to collection' button when copyCount > 0", () => {
    const copies = [makeCopy(1)];
    render(<CardResult card={baseCard} copies={copies} copyCount={1} />);
    expect(
      screen.queryByRole("button", { name: /add to collection/i })
    ).toBeNull();
  });

  it("shows first 5 copy rows and a 'show more' control when copies.length is 6", () => {
    const copies = Array.from({ length: 6 }, (_, i) => makeCopy(i + 1));
    render(<CardResult card={baseCard} copies={copies} copyCount={6} />);
    expect(screen.getAllByTestId("copy-row")).toHaveLength(5);
    expect(screen.getByTestId("show-more")).toBeDefined();
  });
});
