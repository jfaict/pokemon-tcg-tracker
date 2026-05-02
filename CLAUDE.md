# Project memory for Claude Code

> Loaded into context for **every** session in this repo. Keep it short.

## What this repo is

A spec-driven workflow scaffold. Features live in `specs/<slug>/` and follow the pipeline `intent → requirements → design → tasks → execute → doc`.

## How we work here

1. **Read first.** Before doing anything in a feature folder, read these files in order if they exist: `intent.md` → `requirements.md` → `design.md` → `tasks.md`. Then read `memory/constitution.md` and any ADRs the spec references.
2. **One phase at a time.** Don't write design while drafting requirements. Don't write code while drafting tasks. If the user is mid-phase, do not jump ahead — ask whether to advance.
3. **The constitution is law.** If a request contradicts `memory/constitution.md`, surface the conflict and ask the user before proceeding.
4. **Decisions get logged.** Any non-trivial choice (a tech pick, a trade-off, an assumption you made) → propose an ADR via `/adr`. Never silently embed a decision in code.
5. **Conversations are evidence.** When an ADR is grounded in a chat (here or elsewhere), link the saved transcript in `conversations/` from the ADR's `Source` field. Use `/archive-chat` to save the current session.
6. **End-user docs ship with the feature.** `user-docs/` is generated from acceptance criteria + e2e screenshots, never hand-written prose. Front-matter must include `spec:`, `adrs:`, `last-verified:`.

## Slash-commands

The pipeline is automated by commands in `.claude/commands/`:

- `/distill <intake-files>` — Phase 0 capture → intent
- `/spec <slug>` — Phase 1 requirements (EARS)
- `/design <slug>` — Phase 2 technical design + ADRs
- `/tasks <slug>` — Phase 3 TDD-ordered task list
- `/execute <slug> [task-number]` — Phase 4 single-task execution
- `/doc <slug>` — Phase 5 user docs

Supporting: `/constitution`, `/adr <slug>`, `/archive-chat`.

See `.claude/README.md` for details.

## Sub-agents

Defined in `.claude/agents/`. Auto-dispatched by phase, or call explicitly:

- `design-critic` — challenges requirements (gaps, ambiguity, missing edge cases)
- `peer-reviewer` — checks requirements against constitution and intent
- `code-simplifier` — challenges technical design for over-engineering
- `security-checker` — flags auth, data, and dependency risks in design
- `doc-checker` — verifies user-docs front-matter against current specs

## Conventions

- Files: kebab-case. Variables: camelCase. Types: PascalCase.
- Commits: Conventional Commits, one task per commit.
- Branches: `spec/<slug>`.
- Tests are the spec. Every EARS criterion has at least one test.
- Plain language in UI, errors, logs, and docs. No jargon.
