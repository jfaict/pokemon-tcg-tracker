import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const PASSPHRASE = "test-passphrase-abc123";
const SESSION_COOKIE = "session";

describe("middleware", () => {
  beforeEach(() => {
    process.env.AUTH_PASSPHRASE = PASSPHRASE;
    vi.resetModules();
  });

  it("unauthenticated GET / → redirect to /login", async () => {
    const { middleware } = await import("./middleware");
    const req = new NextRequest("http://localhost:3000/");
    const res = await middleware(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("unauthenticated GET /api/search → 401", async () => {
    const { middleware } = await import("./middleware");
    const req = new NextRequest("http://localhost:3000/api/search");
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  it("authenticated GET / (valid signed cookie) → passes through", async () => {
    const { sign } = await import("./lib/auth");
    const { middleware } = await import("./middleware");
    const cookie = await sign("test-session-id");
    const req = new NextRequest("http://localhost:3000/", {
      headers: { cookie: `${SESSION_COOKIE}=${cookie}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
