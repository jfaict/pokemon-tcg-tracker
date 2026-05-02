# User documentation template

> Written for the end user. Not the developer. Not the AI agent.
> Generated **from** `requirements.md` (acceptance criteria → "How to" steps) and **with** screenshots from e2e tests.

## Structure (one folder per feature, plus a top-level index)

```
user-docs/
├── README.md          # landing page, "what is this app?"
├── quickstart.md      # 5-minute happy path
├── how-to/            # task-oriented recipes
│   └── search-cards.md
├── reference/         # exhaustive · auto-generated where possible
│   └── keyboard-shortcuts.md
├── concepts/          # the mental model
│   └── how-search-works.md
├── changelog.md       # what changed and why (cross-links to ADRs)
└── screenshots/       # captured by e2e tests, never hand-edited
```

## How-to template

# How to <task>

**Before you start**
- <prerequisite>

**Steps**
1. <action> · ![screenshot](../screenshots/step-1.png)
2. <action>

**Result**
What you should see / what changed.

**Troubleshooting**
- "I don't see X" → most likely <cause>, fix by <action>

## Linking back to specs
Every doc page has a hidden front-matter block:

```yaml
---
spec: specs/01-card-search/requirements.md#US-1
adrs: [ADR-007, ADR-012]
last-verified: 2025-04-28
---
```

A doc-checker sub-agent runs on every PR and flags pages whose linked spec has changed since `last-verified`.
