# Project constitution

> Non-negotiable principles. Loaded into context for every coding session. Update only deliberately.
> Inspired by GitHub Spec-kit's `/constitution` command and 8090's "alignment engineering".

## Identity
- **Project name:**
- **One-line pitch:**
- **Primary user:**

## Principles (non-negotiable)
1. **Simplicity over cleverness** — if a junior dev would not understand it in 5 minutes, refactor it.
2. **Tests are the specification** — every behaviour described in `requirements.md` has a test.
3. **The decision log is law** — if the code conflicts with an ADR, the code is wrong, not the ADR.
4. **Plain words, not jargon** — applies to UI copy, errors, logs, and docs.
5. *(add your own)*

## Technical constraints
- **Language / runtime:**
- **Framework:**
- **Database:**
- **Hosting:**
- **Things we will not use:** (e.g. "no ORMs", "no client-side state libraries beyond React's built-ins")

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
- v1.0 — initial constitution, <date>
