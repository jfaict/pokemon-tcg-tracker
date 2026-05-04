# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-005 · Use Vitest as the unit and integration test runner

- **Date:** 2026-05-04
- **Status:** proposed
- **Type:** technical
- **Context:** The design specifies unit tests and integration tests for card-search but does not name a test runner. Two viable options exist: Jest (the long-standing default in the JavaScript ecosystem) and Vitest (the modern TypeScript-first alternative). A choice had to be made before the first test file could be written.
- **Decision:** Use Vitest (with `@vitejs/plugin-react` and `jsdom`) as the unit and integration test runner for all non-E2E tests in the card-search feature. E2E tests use Playwright per the design.
- **Assumptions:**
  - Vitest's Jest-compatible API means existing Jest knowledge transfers without relearning syntax.
  - `@libsql/client`'s in-memory mode (`:memory:`) is stable and produces the same SQL semantics as a real Turso DB for testing purposes.
  - Vitest + jsdom is sufficient to test React components without a full browser; Playwright covers the cases that require a real browser.
  - Vitest remains actively maintained and compatible with future Next.js versions for the lifetime of this project.
- **Alternatives considered:**
  - **Jest + ts-jest:** The historical ecosystem default. Rejected: requires additional TypeScript transform configuration with Next.js App Router (custom `jest.config.js` with tsconfig paths, module resolution quirks); cold start time is measurably slower than Vitest.
  - **Jest + Babel:** Even more configuration overhead for TypeScript support; rejected for all ts-jest reasons plus loss of runtime type-checking during tests.
  - **No unit test runner; Playwright-only:** Rejected: Playwright spins up a full browser for every test, making pure-function tests (validation logic, merge logic) prohibitively slow and too coarse-grained.
- **Consequences:**
  - *Easier:* TypeScript works out of the box with zero transform configuration; unit tests run in under 1 second (fast feedback loop); `globals: true` removes import boilerplate from every test file.
  - *Harder:* Vitest is not Jest — subtle API differences (e.g. `vi.mock` vs `jest.mock`, `vi.fn` vs `jest.fn`) may surprise contributors familiar only with Jest; maintaining `@vitejs/plugin-react` as a dev dependency adds one more package to keep synchronized with React and Vitest versions.
  - *Commits us to:* Vitest's mocking model (`vi.fn`, `vi.mock`, `vi.spyOn`) for all unit and integration test doubles in this project. If we ever need to switch back to Jest (unlikely but possible), test files will require non-trivial edits to change mocking syntax.
- **Source:** [conversations/2026-05-04-vitest-decision.md](../../conversations/2026-05-04-vitest-decision.md)
