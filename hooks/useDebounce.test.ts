import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("updates the value after 300 ms", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "initial" },
    });
    rerender({ v: "updated" });
    expect(result.current).toBe("initial");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("intermediate calls do not fire — only the last value is debounced", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    rerender({ v: "abc" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("abc");
  });

  it("passes whitespace-only values through unchanged (caller is responsible for suppression)", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "hello" },
    });
    rerender({ v: "   " });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("   ");
  });

  it("clears the timer on unmount without triggering a state update", () => {
    const { rerender, unmount } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "initial" },
    });
    rerender({ v: "changed" });
    unmount();
    // Advancing timers after unmount must not throw
    act(() => {
      vi.advanceTimersByTime(300);
    });
  });
});
