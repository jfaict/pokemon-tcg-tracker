# Architecture

> Filled in as the first feature lands. Placeholders below.

## Folder layout

```
/
├── app/              # Next.js app router — pages and API routes
├── components/       # Shared UI components
├── lib/              # Business logic, DB client, external API clients
├── specs/            # Feature specs (intent → requirements → design → tasks)
├── memory/           # Project constitution, architecture, ADRs
├── user-docs/        # End-user documentation (generated, not hand-written)
└── conversations/    # Archived chat transcripts linked from ADRs
```

## Data model

> TBD — filled in when the first data feature ships.

## External integrations

> TBD — e.g. Pokémon TCG API for card prices and metadata.

## Key decisions

> See `decisions/` for ADRs.
