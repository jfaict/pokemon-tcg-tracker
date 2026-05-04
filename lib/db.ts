import { createClient } from "@libsql/client";

if (!process.env.TURSO_DB_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set");
}

export const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
