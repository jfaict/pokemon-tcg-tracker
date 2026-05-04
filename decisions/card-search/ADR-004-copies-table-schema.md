# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-004 · Do not mirror the card catalogue in Turso; store only copy records

- **Date:** 2026-05-04
- **Status:** accepted
- **Type:** technical
- **Context:** The app needs to store which cards Jonas owns (copies), with condition, location, and language. The card catalogue (name, set, collector number) lives in pokemontcg.io. A design decision is needed on whether to mirror catalogue data in Turso or rely on live API calls for metadata.
- **Decision:** Only copy records are stored in Turso. The `copies` table references pokemontcg.io card IDs (`card_id TEXT`) but does not duplicate card metadata. Card name, set, and collector number are fetched live from pokemontcg.io at search time and merged server-side. The schema is:
  ```sql
  CREATE TABLE copies (
    id         TEXT NOT NULL PRIMARY KEY,
    card_id    TEXT NOT NULL,
    condition  TEXT NOT NULL,
    location   TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX idx_copies_card_id ON copies (card_id);
  ```
  No `language` column — no requirement drives multi-language copy tracking; add via migration when a future spec does.
- **Assumptions:**
  - pokemontcg.io card IDs are stable — a card ID assigned today will not change or be removed.
  - Turso free tier storage (500 MB) is sufficient for a copies-only table (a few hundred to low thousands of rows).
  - Live pokemontcg.io calls at search time are within the latency budget (server-side P95 < 500 ms, ADR-002).
- **Alternatives considered:**
  - **Mirror full card catalogue in Turso:** eliminates the runtime dependency on pokemontcg.io for metadata; enables full-text search in DB. Rejected: adds a sync mechanism, risks storage limit on Turso free tier, and introduces a data-staleness problem.
  - **Store card name/set inline in copies (denormalised):** simpler reads, but card metadata could drift from pokemontcg.io (e.g. corrected set names). Rejected: correctness risk and violates "single source of truth."
- **Consequences:**
  - *Easier:* schema is minimal; storage stays small; no sync job needed; adding new card attributes requires no migration.
  - *Harder:* if pokemontcg.io removes or changes a card ID, copies become orphaned — no cascade delete or rename possible without a migration. A future maintenance spec should handle this.
  - *Commits us to:* live pokemontcg.io calls for every search that returns results; runtime dependency on API availability for any display of card metadata.
- **Source:** derived from `specs/card-search/design.md` — decision follows from constitution principle against unnecessary complexity and Turso free tier storage constraints.
