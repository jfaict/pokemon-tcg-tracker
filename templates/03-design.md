# Design: <feature name>

> The technical spec. HOW the requirements are met. Reads `requirements.md` and `constitution.md` as constraints.
> If a design choice contradicts the constitution, the design is wrong.

---
references:
  - requirements.md
  - ../../memory/constitution.md
  - ../../memory/architecture.md
  - decision-log.md
---

## Overview
3–5 sentences. The shape of the solution.

## Architecture
- Component diagram (Mermaid)
- How this slots into the existing system

## Data model
- Entities, relationships, indexes
- Migration strategy

## Interfaces
- API endpoints / function signatures
- UI states (link to wireframes)
- Events emitted / consumed

## Error handling
What can go wrong, what the user sees, what gets logged.

## Testing strategy
- Unit: covers …
- Integration: covers …
- E2E: covers … (these screenshots feed `user-docs/`)

## Sequence diagrams
Mermaid for the tricky paths.

## Trade-offs considered
Brief: option A vs option B vs C. The chosen one + why. Anything substantial gets its own ADR in `decision-log/`.

## Open questions
Anything you couldn't resolve. Becomes input to the next iteration or to the decision log.
