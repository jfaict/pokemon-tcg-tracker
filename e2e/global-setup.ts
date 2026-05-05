import { readFileSync } from "fs";
import { resolve } from "path";

async function globalSetup() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // .env.local absent — env vars must be provided externally (e.g. CI secrets)
  }
}

export default globalSetup;
