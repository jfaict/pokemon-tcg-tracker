import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createClient } from "@libsql/client";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const PASSPHRASE = "test-passphrase-copies-integration";

const MIGRATION_SQL = readFileSync(
  join(__dirname, "../../../lib/migrations/001_create_copies.sql"),
  "utf-8"
);

const mockDbRef = vi.hoisted(() => ({ client: null as ReturnType<typeof createClient> | null }));

vi.mock("@/lib/db", () => ({
  get db() {
    return mockDbRef.client;
  },
}));

function makeReq(body: unknown, cookie: string | null): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie !== null) headers.cookie = `session=${cookie}`;
  return new NextRequest("http://localhost:3000/api/copies", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/copies — integration", () => {
  beforeEach(async () => {
    process.env.AUTH_PASSPHRASE = PASSPHRASE;

    const client = createClient({ url: ":memory:" });
    await client.executeMultiple(MIGRATION_SQL);
    mockDbRef.client = client;

    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 201 with copy (id, cardId, condition, location) and inserts a row in the DB", async () => {
    const { sign } = await import("@/lib/auth");
    const { POST } = await import("./route");
    const cookie = await sign("sess-copies-1");
    const body = { cardId: "sv3pt5-25", condition: "NM", location: "Binder 1" };

    const res = await POST(makeReq(body, cookie));

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.copy).toBeDefined();
    expect(typeof json.copy.id).toBe("string");
    expect(json.copy.cardId).toBe("sv3pt5-25");
    expect(json.copy.condition).toBe("NM");
    expect(json.copy.location).toBe("Binder 1");

    // created_at must not be present in the response (REQ 4.3 — client only needs count)
    expect(json.copy.createdAt).toBeUndefined();
    expect(json.copy.created_at).toBeUndefined();

    // Row must exist in the DB
    const result = await mockDbRef.client!.execute({
      sql: "SELECT * FROM copies WHERE id = ?",
      args: [json.copy.id],
    });
    expect(result.rows).toHaveLength(1);
  });

  it("stores created_at in the DB but omits it from the response", async () => {
    const { sign } = await import("@/lib/auth");
    const { POST } = await import("./route");
    const cookie = await sign("sess-copies-2");
    const body = { cardId: "sv3pt5-25", condition: "LP", location: "Binder 2" };

    const res = await POST(makeReq(body, cookie));
    const json = await res.json();

    const result = await mockDbRef.client!.execute({
      sql: "SELECT created_at FROM copies WHERE id = ?",
      args: [json.copy.id],
    });
    expect(result.rows[0].created_at).toBeTruthy();
  });

  // REQ 4.4: failure must surface as an error message, never silent discard
  it("returns 401 with an error body when session cookie is absent", async () => {
    const { POST } = await import("./route");
    const body = { cardId: "sv3pt5-25", condition: "NM", location: "Binder 1" };

    const res = await POST(makeReq(body, null));

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  // REQ 4.4: Turso write failure must return an error message, not a false success state
  it("returns 500 with an error message when Turso write fails", async () => {
    mockDbRef.client = {
      execute: vi.fn().mockRejectedValue(new Error("Turso write failed")),
    } as unknown as ReturnType<typeof createClient>;

    const { sign } = await import("@/lib/auth");
    const { POST } = await import("./route");
    const cookie = await sign("sess-copies-3");
    const body = { cardId: "sv3pt5-25", condition: "NM", location: "Binder 1" };

    const res = await POST(makeReq(body, cookie));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
