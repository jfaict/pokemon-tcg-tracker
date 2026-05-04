import { describe, it, expect } from "vitest";

describe("POST /api/logout", () => {
  it("returns 200 and clears the session cookie", async () => {
    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("session=");
    // Cookie must be expired or have maxAge=0 to be cleared
    const isCleared =
      setCookie.toLowerCase().includes("max-age=0") ||
      setCookie.toLowerCase().includes("expires=thu, 01 jan 1970");
    expect(isCleared).toBe(true);
  });
});
