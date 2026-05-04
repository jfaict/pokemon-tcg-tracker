import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { TURSO_DB_URL, TURSO_AUTH_TOKEN } = process.env;
if (!TURSO_DB_URL || !TURSO_AUTH_TOKEN) {
  console.error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set");
  process.exit(1);
}

const client = createClient({ url: TURSO_DB_URL, authToken: TURSO_AUTH_TOKEN });

const files = readdirSync(__dirname)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const sql = readFileSync(join(__dirname, file), "utf-8");
  await client.executeMultiple(sql);
  console.log(`Applied: ${file}`);
}

console.log("Migrations complete.");
