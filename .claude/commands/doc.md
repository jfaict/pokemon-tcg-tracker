---
description: Phase 5 — generate end-user documentation FROM acceptance criteria + e2e screenshots, with traceability front-matter
argument-hint: <feature-slug>
allowed-tools: Read, Write, Edit, Glob, Grep, Task, Bash(mkdir:*), Bash(ls:*)
model: sonnet
---

# /doc — generate end-user documentation

You are running **Phase 5 (End-user documentation)** of the spec-driven workflow. This is the bonus phase that closes the loop. **Docs are derived, not written.** Their source of truth is the acceptance criteria in `requirements.md` and the screenshots produced by e2e tests in `/execute`.

## Arguments

- `$1` — the feature slug. Required.

## Inputs to read

1. `specs/$1/requirements.md` — acceptance criteria → "How to" steps and "Result" assertions.
2. `specs/$1/intent.md` — the WHY for the `concepts/` page.
3. `decisions/` ADRs linked from `design.md` — for the changelog cross-references.
4. `user-docs/screenshots/` — captured by e2e tests in `/execute`. **Never edit these by hand.** If a screenshot is missing, stop and tell the user which e2e test needs to run first.
5. `templates/06-user-doc.md` — the structure to follow.

Do **not** read code or design.md. End-user docs describe behaviour, not implementation.

## What to do

1. **Pick the right doc type** for each acceptance criterion. Use the [Diátaxis](https://diataxis.fr/) split:
   - **Quickstart** (`user-docs/quickstart.md`) — the 5-minute happy path. One per project, not per feature. Update it if this feature changes the happy path.
   - **How-to** (`user-docs/how-to/<task>.md`) — task-oriented recipe. One per user story.
   - **Reference** (`user-docs/reference/<topic>.md`) — exhaustive listings (keyboard shortcuts, config flags, API endpoints). Auto-generated where possible.
   - **Concept** (`user-docs/concepts/<topic>.md`) — the mental model. One when the feature introduces a new domain idea.

2. **Convert each acceptance criterion to user-facing prose.**
   - `The system SHALL X when Y` → "**To do Y, do this** (steps). **Result: X**."
   - `IF condition THEN system SHALL response` → an entry under "Troubleshooting" or "Edge cases".
   - `WHILE state, system SHALL behaviour` → a "While you're here" callout.

3. **Embed the matching screenshot** from `user-docs/screenshots/`. Filename convention: `<slug>-<step-number>.png`. If a step has no screenshot, mark it `<!-- TODO: screenshot from e2e test <test-name> -->` and flag it in the summary.

4. **Add front-matter to every page** for traceability:
   ```yaml
   ---
   spec: specs/$1/requirements.md#US-N
   adrs: [ADR-NNN, ADR-MMM]   # any ADRs that shape user-visible behaviour
   last-verified: <today, ISO date>
   ---
   ```

5. **Update `user-docs/changelog.md`**: one entry per user-visible change in this feature, cross-linked to the ADRs that explain why.

6. **Run the `doc-checker` sub-agent** (Task tool). It verifies:
   - Every front-matter `spec:` link points to a section that still exists in `requirements.md`.
   - Every `adrs:` ID exists in `decisions/` with status `accepted`.
   - No screenshot references files that don't exist in `user-docs/screenshots/`.
   - No prose contradicts an EARS criterion.
   - `last-verified` is set to today's date for any page touched.

7. **Apply doc-checker feedback** automatically for trivial fixes (broken links, stale dates). For substantive flags (prose drift, missing concepts), pause and ask the user.

8. **Print a summary**:
   - Pages created or updated, with paths.
   - Any TODO screenshot markers.
   - Any front-matter pages whose `last-verified` predates a recent change to `requirements.md` or an ADR — these are the drift risks the doc-checker found.
   - Suggested next step: `/distill <next-feature-slug>` to start the next iteration, or run `/doc <other-slug>` if other features were touched in this PR.

## Quality bar

- A first-time user can follow a how-to without reading anything else.
- Prose plain-language. Match `requirements.md`'s vocabulary exactly — if the spec calls something a "deck", the doc calls it a "deck."
- Every fact in the doc is traceable to a citation: an EARS criterion, an ADR, or a screenshot.
- No marketing language. No "blazing fast", no "delightful", no "robust".

## Anti-patterns to refuse

- Hand-written prose that has no source in `requirements.md` or an ADR. If you want to say it, first add it as an EARS criterion or as an ADR.
- Editing screenshots by hand. They come from e2e tests; if they're wrong, fix the test.
- Skipping the front-matter. Front-matter is the only thing that makes drift detection possible.
- Mixing how-to with reference on the same page. Pick one shape.

## When you discover the spec is incomplete

This phase often surfaces gaps. If a how-to exposes a missing acceptance criterion (e.g. "what happens if the user does X" wasn't covered), stop, and route the gap back to `/spec $1` as a new EARS criterion. Don't paper over the gap with prose.

## After /doc

The feature is shippable. The next loop starts with `/distill <next-slug>`.
