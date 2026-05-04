import type { NextConfig } from "next";

// TURSO_DB_URL, TURSO_AUTH_TOKEN, AUTH_PASSPHRASE, PTCG_API_KEY are
// server-only (no NEXT_PUBLIC_ prefix — Next.js excludes them from the
// client bundle). Validate presence at startup so misconfigurations fail
// loudly rather than at request time.
if (process.env.NODE_ENV !== "test") {
  const required = ["TURSO_DB_URL", "TURSO_AUTH_TOKEN", "AUTH_PASSPHRASE", "PTCG_API_KEY"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required server env var: ${key}`);
    }
  }
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
