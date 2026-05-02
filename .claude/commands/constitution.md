---
description: Bootstrap or amend memory/constitution.md — the project's non-negotiable principles
argument-hint: [amend]
allowed-tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

# /constitution — bootstrap or amend the project constitution

The constitution is the **non-negotiable** layer of project memory. Loaded into context for every session. Inspired by GitHub Spec-kit's `/constitution` and 8090's "alignment engineering."

## Modes

- **No argument** — bootstrap mode. Use this once, at project start.
- **`amend`** — propose a diff to the existing constitution. The constitution itself is append-only-ish: changes get an entry in the version history at the bottom and an ADR to record the rationale.

---

## Bootstrap mode

Run when `memory/constitution.md` does **not** exist or is the unfilled template.

1. **Ask the user** (one question at a time, don't dump a survey):
   - Project name + one-line pitch.
   - Primary user (a real person or persona, not "anyone").
   - 3–5 non-negotiable principles. Push back on platitudes — extract specifics. (Bad: "we value simplicity." Good: "if a junior dev would not understand it in 5 minutes, refactor it.")
   - Technical constraints they want fixed up front: language/runtime, framework, database, hosting.
   - **Things we explicitly will not use.** This is often more useful than the "will use" list.
   - Folder layout (or "default to the template's").
   - Naming and commit conventions (or "default to the template's").

2. **Write `memory/constitution.md`** using `templates/01-constitution.md`. Fill in answers verbatim where possible. Stamp the version line at the bottom: `v1.0 — initial constitution, <ISO date>`.

3. **Stub out `memory/architecture.md`** with placeholders for the folder layout decided above. Tell the user this file gets filled in as the first feature lands.

4. **Print a summary** and suggest the first action: `/distill <first-feature-slug>`.

---

## Amend mode

Run when the user types `/constitution amend`.

1. **Show a diff** — the user describes the change they want; you read the current constitution and propose precise before/after text.

2. **Trigger an ADR.** Constitutional changes are big. Use `/adr project` (project-level ADR, not feature-level) to record:
   - What changed.
   - Why now.
   - What it makes easier.
   - What it makes harder.
   - **Migration plan** — does any existing code, doc, or spec violate the new principle? List remediation tasks.

3. **Apply the change** to `memory/constitution.md` only after the ADR is `accepted`.

4. **Bump the version** at the bottom: `v1.1 — added principle on accessibility, <ISO date>`. Old versions stay readable in git.

5. **Surface debt.** Print every spec, ADR, or doc that conflicts with the new principle and suggest follow-up tasks.

---

## Quality bar

- Principles are specific enough to settle disputes. "We value quality" doesn't settle anything.
- "Will not use" list is as long as the "will use" list.
- Every principle is testable in code review — a reviewer can point at it.

## Anti-patterns to refuse

- Bundling 12 principles. 5 is the upper limit for non-negotiables.
- Vague aesthetic preferences ("clean code", "elegant"). Replace with mechanical checks.
- Mixing principles with conventions. A principle is non-negotiable; a convention can be amended without ceremony.
