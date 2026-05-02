# pokemon-tcg-tracker
Mini application to track my pokemon collection

## Quick start to use the same approach on your own project
1. Copy this entire folder structure into a new git repo:
   - `.claude/`, `CLAUDE.md`, `templates/`
   - empty: `intake/`, `memory/`, `decisions/`, `conversations/`, `specs/`, `user-docs/`
2. Open the project in Claude Code. The slash-commands appear in the `/` menu automatically.
3. Run `/constitution` once to bootstrap `memory/constitution.md`.
4. Drop your first rough notes into `intake/` and run `/distill <slug>`.

## The pipeline at a glance

| Phase | Command | Output | Reviewers |
|-------|---------|--------|-----------|
| 0 — Capture | `/distill <slug>` | `specs/<slug>/intent.md` | (none) |
| 1 — Functional | `/spec <slug>` | `specs/<slug>/requirements.md` | design-critic, peer-reviewer |
| 2 — Technical | `/design <slug>` | `specs/<slug>/design.md` + ADRs | code-simplifier, security-checker |
| 3 — Tasks | `/tasks <slug>` | `specs/<slug>/tasks.md` | (none) |
| 4 — Execute | `/execute <slug> [task]` | code + tests, one task per call | (tests are the reviewer) |
| 5 — Docs | `/doc <slug>` | `user-docs/<slug>/*` | doc-checker |

Plus: `/constitution` (bootstrap or amend), `/adr <slug> "<title>"` (record a decision), `/archive-chat <slug>` (save the current chat as a citable transcript).