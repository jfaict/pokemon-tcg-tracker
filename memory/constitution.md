# Project constitution

> Non-negotiable principles. Loaded into context for every coding session. Update only deliberately.
> Inspired by GitHub Spec-kit's `/constitution` command and 8090's "alignment engineering".

## Identity
- **Project name:** Pokémon TCG Tracker
- **One-line pitch:** A lightweight web app for tracking your personal Pokémon TCG collection and prices.
- **Primary user:** Jonas, a collector who wants to know the current content and value of his binders without opening a spreadsheet.

## Principles (non-negotiable)
1. **Fast lookups, always** — card ownership and market value must be retrievable in under 3 seconds. A feature that breaks this for in-store use is not shippable.
2. **Free to run** — total monthly hosting cost must stay at €0 (Vercel free tier + Turso free tier). Any feature requiring paid infrastructure is rejected.
3. **One-doc changeability** — any developer with basic web skills can make a change without reading more than one document. If understanding a change requires reading two docs, the code is too tangled.
4. **Local changes only** — no global refactors to add a feature. Changes must be local to one module. If adding a card attribute touches more than 2 files, the design is wrong.
5. **No silent data loss** — card data is never lost without the user being explicitly informed. Write failures surface as visible errors, not silent no-ops.

## Technical constraints
- **Language / runtime:** TypeScript
- **Framework:** Next.js
- **Database:** Turso (hosted SQLite, free tier) — SQLite-compatible, accessed via libsql driver
- **Hosting:** Vercel (free tier)
- **Things we will not use:**
  - Kubernetes or any container orchestration
  - Managed databases requiring payment
  - Background workers or daemons
  - ORMs (query with the libsql driver directly or a thin query builder)
  - Paid third-party services

## Conventions
- **Folder layout:** see `architecture.md`
- **Naming:** kebab-case files, camelCase variables, PascalCase types
- **Commits:** Conventional Commits, one task per commit
- **Branches:** one branch per spec, named `spec/<feature-slug>`

## Workflow rules
- Every feature starts with an `intent.md` and ends with updated `user-docs/`.
- Context is cleared between phases (idea → req → design → tasks → exec).
- Sub-agents review every spec phase before human sign-off.
- The decision log is updated *whenever* a real choice is made — even small ones.

## Versioning
- v1.0 — initial constitution, 2026-05-02
