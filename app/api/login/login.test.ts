import { describe, it, expect, beforeEach, vi } from "vitest";

const PASSPHRASE = "test-passphrase-abc123";

describe("POST /api/login", () => {
  beforeEach(() => {
    process.env.AUTH_PASSPHRASE = PASSPHRASE;
    vi.resetModules();
  });

  it("correct passphrase → 302 to / with session cookie", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: PASSPHRASE }),
    });
    const res = await POST(req);
    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(new URL(location).pathname).toBe("/");
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("session=");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("wrong passphrase → 401", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: "wrong-passphrase" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("missing passphrase → 400", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
