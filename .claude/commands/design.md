---
description: Phase 2 — turn requirements.md into a technical design + ADRs, reviewed by sub-agents
argument-hint: <feature-slug>
allowed-tools: Read, Write, Glob, Grep, Task, Bash(mkdir:*)
model: sonnet
---

# /design — write the technical design (HOW)

You are running **Phase 2 (Technical)** of the spec-driven workflow. Your job is to produce `design.md` and surface every non-trivial choice as an ADR. **No code.** No task list. Those come next.

## Arguments

- `$1` — the feature slug. Required.

## Inputs to read

1. `specs/$1/requirements.md` — the contract you have to meet. If missing, stop and tell the user to run `/spec $1`.
2. `specs/$1/intent.md` — for the WHY when trade-offs come up.
3. `memory/constitution.md` — the rules. If a design choice contradicts the constitution, the design is wrong.
4. `memory/architecture.md` — the existing system shape this feature has to slot into.
5. `decisions/` — every accepted ADR. **You inherit these.** If a new design choice contradicts an accepted ADR, surface the conflict and propose either (a) a different design or (b) a new ADR that supersedes the old one.

Do **not** read `tasks.md` or code from prior iterations.

## What to do

1. **Read requirements + constraints.** For each acceptance criterion, note what the design has to provide (data, interfaces, error paths, performance).

2. **Identify the decisions** this feature forces. Categorise each as:
   - **Constitutional** — already settled (cite the constitution).
   - **Inherited** — already settled by an existing ADR (cite it).
   - **New** — needs an ADR. Examples: choice of library, data shape, sync vs async, cache strategy, auth model.

3. **For every "New" decision**, draft an ADR via `/adr $1` style entry (see `templates/05-decision-log.md`). Each ADR must include:
   - `Context`, `Decision`, `Assumptions`, `Alternatives considered`, `Consequences`.
   - **`Source` field**: link to the conversation transcript in `conversations/`. If the decision was hashed out in this very session, run `/archive-chat` first so the link resolves.
   - Status starts as `proposed`. The human flips it to `accepted` (or rejects it) before you continue.

4. **Draft `specs/$1/design.md`** using `templates/03-design.md`. Required sections:
   - `Overview` — 3–5 sentences, the shape of the solution.
   - `Architecture` — Mermaid component diagram + how this slots into `architecture.md`.
   - `Data model` — entities, relationships, indexes, migration strategy.
   - `Interfaces` — API endpoints / function signatures, UI states, events.
   - `Error handling` — what can go wrong, what the user sees, what gets logged.
   - `Testing strategy` — unit / integration / e2e split. Note **which e2e tests will produce screenshots for `user-docs/`**.
   - `Sequence diagrams` — Mermaid for the tricky paths (auth, retries, conflict resolution).
   - `Trade-offs considered` — short-form. Anything substantial gets its own ADR — link to it from here.
   - `Open questions` — anything still unsettled.

5. **Run two sub-agents in parallel** (Task tool):
   - `code-simplifier` — argues for the boring solution. Flags over-engineering, premature abstractions, speculative generality.
   - `security-checker` — flags auth, authz, data handling, dependency, and supply-chain risks.

   Print their feedback grouped by criticality (Blockers / Warnings / Suggestions), same as `/spec`.

6. **Pause for the human** to accept, push back, or amend. Apply accepted feedback. Update or add ADRs to capture the rationale for the changes.

7. **Print a summary**:
   - Path to `design.md`.
   - Path to each new ADR and its current status.
   - Unresolved open questions.
   - Suggested next command: `/tasks $1`.

## Quality bar

- A senior engineer can read `design.md` + the linked ADRs and implement the feature without reading the chat history.
- Every "we chose X over Y" has a recorded reason — either inline (small) or in an ADR (large).
- No code. Pseudocode for sequence steps is fine; full implementations are not.
- Every interface surface is testable from the outside.

## Anti-patterns to refuse

- Picking a library, framework, or service without an ADR.
- "We'll figure it out at implementation time." Not acceptable for anything user-visible or anything that touches data.
- Re-litigating decisions captured in accepted ADRs without first proposing a superseding ADR.
- Hiding assumptions inline. Every assumption goes in the matching ADR's `Assumptions` field.

## When the constitution and the requirements collide

The constitution wins. Stop, surface the conflict, and ask the human whether to (a) amend the requirements, (b) amend the constitution (rare — propose an ADR), or (c) drop the feature.

After you finish, the next phase is `/tasks $1`.
