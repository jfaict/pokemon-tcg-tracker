import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Home from "./page";

// Advance fake timers past the 300 ms debounce delay
const PAST_DEBOUNCE = 400;

describe("app/page.tsx — whitespace suppression (REQ 1.4)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), { status: 200 })
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it("does not call /api/search on mount (empty initial query)", async () => {
    render(<Home />);
    await act(async () => {
      vi.advanceTimersByTime(PAST_DEBOUNCE);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not call /api/search when the query is whitespace-only", async () => {
    render(<Home />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "   " } });
    await act(async () => {
      vi.advanceTimersByTime(PAST_DEBOUNCE);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows 'Type a card name to search' prompt for whitespace-only query", async () => {
    render(<Home />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "   " } });
    await act(async () => {
      vi.advanceTimersByTime(PAST_DEBOUNCE);
    });
    expect(screen.getByText("Type a card name to search")).toBeDefined();
  });

  it("calls /api/search for a non-empty, non-whitespace query", async () => {
    render(<Home />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "Pikachu" } });
    await act(async () => {
      vi.advanceTimersByTime(PAST_DEBOUNCE);
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/search?q=")
    );
  });
});
