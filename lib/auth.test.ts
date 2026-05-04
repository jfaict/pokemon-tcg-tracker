import { describe, it, expect, beforeEach, vi } from "vitest";

const PASSPHRASE = "test-passphrase-abc123";
const SESSION_ID = "test-session-id-00000000-0000-0000-0000-000000000000";

describe("lib/auth", () => {
  beforeEach(() => {
    process.env.AUTH_PASSPHRASE = PASSPHRASE;
    vi.resetModules();
  });

  it("sign() produces a base64url string", async () => {
    const { sign } = await import("./auth");
    const cookie = sign(SESSION_ID);
    expect(typeof cookie).toBe("string");
    expect(cookie.length).toBeGreaterThan(0);
    // base64url uses A-Za-z0-9, -, _ — structural dots are allowed as separators
    expect(cookie).toMatch(/^[A-Za-z0-9\-_.]+$/);
  });

  it("verify() returns the sessionId for a valid signed cookie", async () => {
    const { sign, verify } = await import("./auth");
    const cookie = sign(SESSION_ID);
    expect(verify(cookie)).toBe(SESSION_ID);
  });

  it("verify() returns null for a tampered cookie", async () => {
    const { sign, verify } = await import("./auth");
    const cookie = sign(SESSION_ID);
    const tampered = cookie.slice(0, -4) + "XXXX";
    expect(verify(tampered)).toBeNull();
  });

  it("verify() returns null when version claim does not match current AUTH_PASSPHRASE", async () => {
    const { sign } = await import("./auth");
    const cookie = sign(SESSION_ID);

    process.env.AUTH_PASSPHRASE = "rotated-passphrase-xyz987";
    vi.resetModules();
    const { verify } = await import("./auth");
    expect(verify(cookie)).toBeNull();
  });
});
