# Claude Code commands — SDD workflow

This folder turns the spec-driven workflow into Claude Code slash-commands and sub-agents.

## How Claude Code discovers these files

- **Commands** live in `.claude/commands/*.md`. Filename → command name. `distill.md` becomes `/distill`. ([Claude Code docs](https://docs.anthropic.com/en/docs/claude-code/slash-commands))
- **Sub-agents** live in `.claude/agents/*.md`. They are dispatched automatically by description match, or explicitly with "use the design-critic sub-agent on …".
- Both file types use YAML frontmatter. Description must be a single line — multi-line descriptions silently break discovery.

## The pipeline

```
/distill   → intake/*  →  specs/<slug>/intent.md
/spec      → intent.md →  specs/<slug>/requirements.md   (calls design-critic + peer-reviewer)
/design    → req       →  specs/<slug>/design.md         (calls code-simplifier + security-checker)
                       →  decisions/ADR-NNN-*.md         (any non-trivial choice)
/tasks     → design    →  specs/<slug>/tasks.md
/execute   → tasks     →  one box ticked, tests green
/doc       → req + e2e →  user-docs/<slug>/*             (calls doc-checker)
```

## Supporting commands

- `/constitution` — bootstrap or amend `memory/constitution.md`.
- `/adr <slug>` — append a new entry to the decision log.
- `/archive-chat` — save the current conversation transcript to `conversations/` and link it from any ADRs that came out of it.

## Conventions

- One feature per branch, named `spec/<slug>`.
- Context is **cleared between phases**. Each command reads only what it needs.
- Sub-agents block on the human until their feedback is acknowledged.
- Every ADR has `Assumptions` and `Source` (link to the chat in `conversations/`).
- The decision log is append-only. To change a decision, write a new ADR that supersedes the old one.

## Installing into a new project

```bash
cp -r .claude /path/to/your-project/
cp -r templates /path/to/your-project/
mkdir -p /path/to/your-project/{intake,memory,decisions,conversations,specs,user-docs}
```

Then run `/constitution` first.
