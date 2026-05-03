# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.
> Format inspired by Michael Nygard's ADRs.

## ADR-001 · Use pokemontcg.io as the card catalogue API

- **Date:** 2026-05-03
- **Status:** accepted
- **Type:** technical
- **Context:** The card-search feature requires an external card catalogue to search against — card name alone is not sufficient to identify a card, and maintaining a local catalogue is out of scope. An API must be selected before design can proceed (OQ-1 in `specs/card-search/requirements.md`).
- **Decision:** We will use the pokemontcg.io API as the external card catalogue for name-based card search.
- **Assumptions:**
  - The free tier (20,000 requests/day with API key) is sufficient for a single-user personal tracker.
  - The collection is English-only; pokemontcg.io's EN focus is acceptable for the foreseeable future.
  - pokemontcg.io will remain available and free for the lifetime of this project.
- **Alternatives considered:**
  - **TCGdex** — credible alternative with 14-language support and no rate limits; rejected because pokemontcg.io is the community standard with a stronger reliability track record.
  - **PokemonPriceTracker** — includes pricing data but free tier is only 100 req/day; insufficient for practical use.
  - **TCGPlayer** — closed to new developers; not viable.
- **Consequences:**
  - *Easier:* card search implementation — TypeScript SDK available, well-documented, abundant community examples.
  - *Harder:* adding non-EN cards (JP, etc.) in the future will require introducing a second API or switching entirely.
  - *Commits us to:* EN-only card catalogue until a second API is added; hard runtime dependency on pokemontcg.io availability for every search request.
- **Source:** [conversations/2026-05-03-card-catalogue-api.md](../../conversations/2026-05-03-card-catalogue-api.md)
