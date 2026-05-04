import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

async function openInMemory() {
  const client = createClient({ url: ":memory:" });
  return client;
}

describe("001_create_copies migration", () => {
  it("creates copies table with correct columns", async () => {
    const client = await openInMemory();
    const sql = readFileSync(
      join(__dirname, "001_create_copies.sql"),
      "utf-8"
    );
    await client.executeMultiple(sql);

    const result = await client.execute("PRAGMA table_info(copies)");
    const columns = result.rows.map((r) => ({ name: r.name, type: r.type, notnull: r.notnull }));
    const names = columns.map((c) => c.name);

    expect(names).toContain("id");
    expect(names).toContain("card_id");
    expect(names).toContain("condition");
    expect(names).toContain("location");
    expect(names).toContain("created_at");

    const id = columns.find((c) => c.name === "id");
    expect(id?.type).toBe("TEXT");
    expect(id?.notnull).toBe(1);

    const cardId = columns.find((c) => c.name === "card_id");
    expect(cardId?.type).toBe("TEXT");
    expect(cardId?.notnull).toBe(1);

    const condition = columns.find((c) => c.name === "condition");
    expect(condition?.type).toBe("TEXT");
    expect(condition?.notnull).toBe(1);

    const location = columns.find((c) => c.name === "location");
    expect(location?.type).toBe("TEXT");
    expect(location?.notnull).toBe(1);

    const createdAt = columns.find((c) => c.name === "created_at");
    expect(createdAt?.type).toBe("TEXT");
    expect(createdAt?.notnull).toBe(1);
  });

  it("creates idx_copies_card_id index", async () => {
    const client = await openInMemory();
    const sql = readFileSync(
      join(__dirname, "001_create_copies.sql"),
      "utf-8"
    );
    await client.executeMultiple(sql);

    const result = await client.execute("PRAGMA index_list(copies)");
    const indexNames = result.rows.map((r) => r.name);

    expect(indexNames).toContain("idx_copies_card_id");
  });

  it("primary key is id column", async () => {
    const client = await openInMemory();
    const sql = readFileSync(
      join(__dirname, "001_create_copies.sql"),
      "utf-8"
    );
    await client.executeMultiple(sql);

    const result = await client.execute("PRAGMA table_info(copies)");
    const id = result.rows.find((r) => r.name === "id");

    expect(id?.pk).toBe(1);
  });
});
