---
description: Phase 3 — turn requirements + design into a TDD-ordered task list (max 2 nesting levels)
argument-hint: <feature-slug>
allowed-tools: Read, Write, Glob, Grep
model: sonnet
---

# /tasks — produce the task list

You are running **Phase 3 (Tasks)** of the spec-driven workflow. Your job is to slice the design into the smallest possible test-first tasks. **No code yet.** Each task becomes one entry in `/execute`.

## Arguments

- `$1` — the feature slug. Required.

## Inputs to read

1. `specs/$1/requirements.md` — the source of REQ numbers each task references.
2. `specs/$1/design.md` — the source of components, data, interfaces.
3. `decisions/` ADRs linked from `design.md`.
4. `memory/constitution.md` — for testing, naming, and commit conventions.

Do **not** read prior code. Tasks describe new work; they don't grade old work.

## What to do

1. **Decompose the design into a tree of tasks** using `templates/04-tasks.md`. Rules:
   - **Max 2 nesting levels.** `1.` and `1.1` allowed. `1.1.1` is forbidden — flatten or split.
   - **TDD order** within each main task: write the failing test first, then the implementation, then refactor. Each is a separate sub-task.
   - **Every sub-task references a requirement** by REQ number (e.g. `References: REQ 1.1, 1.3`). If a sub-task can't cite a requirement, it shouldn't exist — push back to `/spec` or `/design`.
   - **One commit per main task.** Sub-tasks within a main task may share a commit only if they're a tight test-then-impl pair.
   - **Each main task is independently mergeable.** No "task 4 depends on a half-finished task 2."

2. **Order main tasks** to enable early feedback:
   - Start with the slice that proves the riskiest assumption.
   - Place data-layer scaffolding before features that depend on it.
   - Place at least one happy-path e2e test in the first 3 tasks — that screenshot will seed `user-docs/`.

3. **Flag tasks that need a fresh context window** with a `[fresh-ctx]` marker. Anything that requires reading more than ~2 files of context is a candidate.

4. **Add a `Definition of done`** at the bottom (the template provides one):
   - All boxes checked.
   - All tests green.
   - Linter clean.
   - Decision log updated for any choices made during execution.
   - `user-docs/` regenerated for any user-visible change.

5. **Print a summary**:
   - Path to `tasks.md`.
   - Total task count and rough size (e.g. "8 main tasks, 24 sub-tasks").
   - First 3 main tasks listed verbatim, so the user can sanity-check ordering.
   - Suggested next command: `/execute $1` (starts at task 1) or `/execute $1 2.1` (jump in).

## Quality bar

- A new contributor can pick up `tasks.md` cold and know exactly what to do next.
- Every task is doable in under ~30 minutes of focused work. If a sub-task feels longer, split it.
- No "implement feature X" mega-tasks. Granularity is the whole point.
- Acceptance criteria coverage: every EARS criterion is referenced by at least one test task. Print a coverage table at the end of `tasks.md` to prove it.

## Anti-patterns to refuse

- Sub-tasks deeper than 2 levels.
- Tasks without REQ references.
- "Refactor X" as a standalone task — refactor lives inside a TDD triplet (red → green → refactor).
- Front-loading 5 setup tasks before any user-visible behaviour. Re-order so the user can see the first slice run end-to-end early.

## After /tasks

The next phase is `/execute $1`. From there, **one task at a time** with a fresh context window per main task.
