---
description: Phase 1 — turn intent.md into functional requirements in EARS format, reviewed by sub-agents
argument-hint: <feature-slug>
allowed-tools: Read, Write, Glob, Grep, Task
model: sonnet
---

# /spec — write the functional spec (WHAT and WHY only)

You are running **Phase 1 (Functional)** of the spec-driven workflow. Your job is to turn `intent.md` into a `requirements.md` that downstream phases can rely on. **No technical decisions here.** If a tech choice is forced, note it as an open question for `/design`.

## Arguments

- `$1` — the feature slug. Required.

## Inputs to read

1. `specs/$1/intent.md` — the upstream artifact. If it doesn't exist, stop and tell the user to run `/distill $1` first.
2. `memory/constitution.md` — non-negotiables.
3. Existing ADRs in `decisions/` whose status is `accepted`. Skim only — do not adopt their conclusions blindly.

Do **not** read `design.md`, `tasks.md`, or code. They don't exist yet, or if they do, they belong to a previous iteration whose assumptions you're about to invalidate.

## What to do

1. **Read `intent.md`** and extract:
   - Every user-visible behaviour implied by the vision.
   - Every "Open question" that is actually a functional question (vs. a technical one).

2. **Draft `specs/$1/requirements.md`** using `templates/02-requirements.md`. Required sections:
   - `Introduction` — two paragraphs, smart-non-technical-reader voice.
   - `User stories` — at least one per persona implied by the intent. Each has:
     - `As a / I want / So that` triplet.
     - **Acceptance criteria in EARS format** (Easy Approach to Requirements Syntax). Use the patterns:
       - `The system SHALL <behaviour> when <trigger>.`
       - `The system SHALL NOT <forbidden behaviour> when <condition>.`
       - `IF <condition> THEN the system SHALL <response>.`
       - `WHILE <state>, the system SHALL <continuous behaviour>.`
     - Number criteria as `<story-number>.<criterion-number>` (e.g. `1.3`) so tasks can reference them.
   - `Edge cases` — empty input, malformed input, offline, mid-deploy users, abuse.
   - `Non-functional requirements` — performance budgets, accessibility level, browser/device support, i18n. Pull constraints from the constitution.
   - `Out of scope` — explicit list, including anything the intent's `Non-goals` mentioned.
   - `Open questions for the human` — answered later via `/adr` or by the human directly.

3. **Run two sub-agents** (in parallel via the Task tool):
   - `design-critic` — adversarial: find ambiguities, missing edge cases, untestable criteria, hidden assumptions.
   - `peer-reviewer` — checks alignment with `intent.md` and `memory/constitution.md`.

   Wait for both to return. Print their feedback to the user, **grouped by criticality**:
   - **Blockers** (must fix before `/design`): ambiguous criteria, missing personas, contradictions with constitution.
   - **Warnings** (should fix): missing edge cases, weak non-functionals.
   - **Suggestions** (consider): wording polish, additional test ideas.

4. **Wait for the human** to either accept the feedback (you apply it) or push back (record their reasoning in `Open questions for the human`). Do not silently apply sub-agent feedback — alignment is a human checkpoint.

5. **Re-write `requirements.md`** with accepted changes. Bump the version note at the bottom: `_v2 — applied design-critic feedback on edge cases_`.

6. **Print a summary** to the user:
   - Path to the file.
   - Number of user stories and acceptance criteria.
   - Unresolved open questions.
   - Suggested next command: `/design $1`.

## Quality bar

- Every acceptance criterion is **testable**. If you can't write a test for it, rewrite it.
- No HOW. No "we'll use Postgres", no "via a REST endpoint", no "with React Query". Those are `/design`'s job.
- No vanity criteria like "the user is delighted". Behaviour or measurement only.
- The smart-non-technical reader test: a product manager who has never seen the intake can read this top-to-bottom and explain the feature back.

## Anti-patterns to refuse

- "The system SHALL be fast." → Replace with a concrete budget (e.g. "p95 search response under 200 ms on the user's device").
- "The system SHALL be user-friendly." → Replace with specific behaviours.
- Mixing functional and non-functional in the same criterion.
- Stuffing implementation hints into criteria ("SHALL store in Redis"). Move to `Open questions for the human` for `/design` to consider.

After you finish, the next phase is `/design $1`.
