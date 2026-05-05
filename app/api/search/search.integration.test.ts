import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createClient } from "@libsql/client";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const PASSPHRASE = "test-passphrase-integration";

const MIGRATION_SQL = readFileSync(
  join(__dirname, "../../../lib/migrations/001_create_copies.sql"),
  "utf-8"
);

// Hoisted so the factory below can reference it before module-level code runs.
const mockDbRef = vi.hoisted(() => ({ client: null as ReturnType<typeof createClient> | null }));

vi.mock("@/lib/db", () => ({
  get db() {
    return mockDbRef.client;
  },
}));

const PTCG_CARD = {
  id: "sv3pt5-25",
  name: "Pikachu",
  set: { name: "151" },
  number: "025/165",
};

function fetchSuccess() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [PTCG_CARD] }),
  } as unknown as Response);
}

function fetchThrows() {
  return vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
}

function makeReq(q: string | undefined, cookie: string | null): NextRequest {
  const url = new URL("http://localhost:3000/api/search");
  if (q !== undefined) url.searchParams.set("q", q);
  const headers: Record<string, string> = {};
  if (cookie !== null) headers.cookie = `session=${cookie}`;
  return new NextRequest(url.toString(), { headers });
}

describe("GET /api/search — integration error paths", () => {
  beforeEach(async () => {
    process.env.AUTH_PASSPHRASE = PASSPHRASE;

    const client = createClient({ url: ":memory:" });
    await client.executeMultiple(MIGRATION_SQL);
    mockDbRef.client = client;

    vi.resetModules();
    vi.stubGlobal("fetch", fetchSuccess());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 401 when session cookie is absent", async () => {
    const { GET } = await import("./route");
    const req = makeReq("Pikachu", null);
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when q is empty", async () => {
    const { sign } = await import("@/lib/auth");
    const { GET } = await import("./route");
    const req = makeReq("", await sign("sess-1"));
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when q contains invalid characters", async () => {
    const { sign } = await import("@/lib/auth");
    const { GET } = await import("./route");
    const req = makeReq("<script>", await sign("sess-2"));
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 after 60 requests in the same window (rate limit)", async () => {
    const { sign } = await import("@/lib/auth");
    const { GET } = await import("./route");
    const cookie = await sign("rate-sess");

    for (let i = 0; i < 60; i++) {
      const res = await GET(makeReq("Pikachu", cookie));
      expect(res.status).toBe(200);
    }

    const res = await GET(makeReq("Pikachu", cookie));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 502 when pokemontcg.io is unreachable", async () => {
    vi.stubGlobal("fetch", fetchThrows());
    const { sign } = await import("@/lib/auth");
    const { GET } = await import("./route");
    const req = makeReq("Pikachu", await sign("sess-3"));
    const res = await GET(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  // REQ 2.5: DB read failure must surface as a distinct 500 error, never as a 0-copy result.
  it("returns 500 with an error body (not a 0-copy result) when Turso read fails", async () => {
    mockDbRef.client = {
      execute: vi.fn().mockRejectedValue(new Error("Turso connection lost")),
    } as unknown as ReturnType<typeof createClient>;

    const { sign } = await import("@/lib/auth");
    const { GET } = await import("./route");
    const req = makeReq("Pikachu", await sign("sess-4"));
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.results).toBeUndefined();
  });
});
