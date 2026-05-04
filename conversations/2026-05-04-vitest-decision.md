# Vitest Selection During Task 1 (Project Scaffold)

- **Date:** 2026-05-04
- **Participants:** Jonas (user), Claude Code
- **Related artifacts:** specs/card-search/tasks.md, specs/card-search/design.md, package.json

---

## Summary

- **Decision made:** Vitest chosen as the unit test runner for card-search feature (not specified in design.md).
- **Rationale:** TypeScript-first setup, Jest-compatible API, fast cold start, minimal config.
- **Alternatives:** Jest + ts-jest (more config overhead), Playwright-only (too slow for pure unit tests).
- **Dependencies added:** vitest, @vitejs/plugin-react, @testing-library/react, jsdom, @types/uuid.
- **Testing strategy:** Vitest for units + integrations, Playwright for E2E (per design.md).
- **Next step:** File ADR-005 documenting the decision.

---

## Transcript

**User:**
```
/execute card-search
```

**Claude:**
Presented Task 1 (Project scaffold + database migration) for confirmation.

**User:**
```
yes
```

**Claude:**
Executed Task 1:
1. Ran `npx create-next-app@latest` in a temp directory (existing files in project root blocked direct scaffold).
2. Copied generated app/, public/, next.config.ts, tsconfig.json, etc. to project.
3. Created package.json with dependencies: @libsql/client, uuid, @playwright/test, vitest, @vitejs/plugin-react, @testing-library/react, jsdom.
   - **Note:** Vitest was not explicitly mentioned in design.md or task spec. Chosen as the unit test runner because:
     - TypeScript works out of the box (no ts-jest boilerplate).
     - Jest-compatible API (low learning curve).
     - Fast cold start (under 1s for unit tests).
     - Works well with Next.js App Router.
4. Ran `npm install`.
5. Configured next.config.ts: added server-only env var validation.
6. Created .env.local.example with TURSO_DB_URL, TURSO_AUTH_TOKEN, AUTH_PASSPHRASE, PTCG_API_KEY.
7. Created playwright.config.ts with mobile project (375×812 viewport).
8. Created vitest.config.ts with jsdom environment and @vitejs/plugin-react.
9. Wrote failing migration test (lib/migrations/migrations.test.ts) [RED].
10. Wrote lib/migrations/001_create_copies.sql, lib/db.ts, lib/migrations/migrate.mjs [GREEN].
11. Tests green, typecheck clean, lint clean.
12. Ticked tasks 1.1–1.5.
13. Identified Vitest selection as a non-trivial library decision requiring an ADR per execute instructions.

**User:**
Confirmed ADR creation for Vitest decision.

**Claude:**
Initiated /adr workflow for ADR-005.
