---
description: Phase 4 — execute exactly one task from tasks.md with TDD, automated verification, and rollback discipline
argument-hint: <feature-slug> [task-number]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

# /execute — execute one task at a time

You are running **Phase 4 (Execute & verify)** of the spec-driven workflow. Your job is to do **exactly one task** from `tasks.md`, ship it green, and stop. **Do not chain tasks**, even if you "could." A fresh context window per main task is a feature, not a bug.

## Arguments

- `$1` — the feature slug. Required.
- `$2` — optional task number (e.g. `2.1`). If omitted, pick the **first unchecked sub-task** in `specs/$1/tasks.md`.

## Inputs to read

In this exact order, then **stop reading**:

1. `specs/$1/tasks.md` — to identify the task and its REQ references.
2. The acceptance criteria referenced by this task in `specs/$1/requirements.md`.
3. The relevant section of `specs/$1/design.md` (one component / one interface — not the whole file).
4. ADRs linked from those sections.
5. `memory/constitution.md` — for naming, test, commit conventions.

Do **not** read other tasks, other specs, or unrelated code. Stay narrow.

## What to do

1. **Print the task** verbatim, plus its REQ references and the acceptance criteria. Confirm with the user this is the task to run. (Skip confirmation only if `$2` was passed — that's already explicit.)

2. **Plan in 3 bullets.** Before touching code, write:
   - The failing test you'll add (file path + test name).
   - The implementation change (file path + roughly what changes).
   - The verification step (which command tells you it's green).

3. **Red.** Add the failing test. Run it. Confirm it fails for the right reason.

4. **Green.** Make the smallest change that turns the test green. Resist scope creep.

5. **Refactor.** Tidy only what this task touches. No drive-by refactors — log them as new entries in `intake/` with the prefix `cleanup-` for a future iteration.

6. **Verify.**
   - Run the test suite (or the relevant subset).
   - Run the linter.
   - If the constitution requires it, run the type-checker.
   - If this task touches user-visible behaviour, run the e2e test that captures the screenshot for `user-docs/`.

7. **If anything is red after the change**, decide one of:
   - **Fix forward** if the failure is a small, contained issue with a clear cause.
   - **Roll back without guilt** if the change ballooned beyond the planned 3 bullets. Reverting is cheap; bad context is expensive. Tell the user what you're rolling back and why, then propose splitting the task in `tasks.md`.

8. **Update the artifacts.**
   - Tick the task box in `tasks.md`.
   - If you made a non-trivial decision (a library pick, a data shape change, a deviation from `design.md`), trigger an ADR via `/adr $1` and link it in `design.md`'s `Trade-offs considered`. Do not silently embed decisions in code.
   - If the task changed user-visible behaviour, note it for `/doc $1` to pick up later. Do not generate user docs in this phase.

9. **Commit.** One commit per main task. Conventional Commit format. Reference the task number and REQ numbers in the message:
   ```
   feat(card-search): implement substring search · task 2.1 · REQ 1.1, 1.3
   ```

10. **Print a summary**:
    - Task ticked off.
    - Files changed.
    - Tests added / passing count.
    - Any new ADRs.
    - Suggested next step:
      - If more tasks remain: `/execute $1` to pick the next one (with a **fresh context window** — instruct the user to clear or restart).
      - If all tasks are done: `/doc $1`.

## Quality bar

- Tests assert behaviour from `requirements.md`, not implementation details.
- No new dependency without an ADR (`/adr $1`).
- No edits to `requirements.md` or `design.md` from inside `/execute`. If those documents are wrong, stop and route back to `/spec` or `/design`.
- The diff is reviewable in under 5 minutes by a peer who knows the spec.

## Hard rules

- **One task. Stop.** Even if the next sub-task is "trivial," stop.
- **Fresh context per main task.** Each `/execute` call should start with the smallest possible read set.
- **Roll back if you wandered.** A 12-file diff for a 2-file task is a smell.

## When the spec is wrong

If you discover that the requirement or design is wrong while implementing, stop. Don't silently fix it in code. Either:
- Route to `/spec $1` if a functional assumption was wrong.
- Route to `/design $1` if a technical assumption was wrong.
- File an ADR via `/adr $1` if the discovery is a small clarification.

After this command, the next steps are usually `/execute $1` again (next task) or `/doc $1` when the feature is complete.
