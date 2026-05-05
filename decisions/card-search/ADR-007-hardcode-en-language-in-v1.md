# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-007 · Hardcode language to "EN" in v1; omit language column from copies table

- **Date:** 2026-05-05
- **Status:** accepted
- **Type:** technical
- **Context:** Requirements 1.6 and 2.3 state that search results and copy details must display card language. The intent document flags that the data model must not assume EN-only, because Jonas may add non-EN cards in future. However, Jonas currently owns only English cards. A decision is needed on whether to store and collect language per copy in v1, or hardcode it for now.
- **Decision:** Language is hardcoded to "EN" in v1. The `copies` table (ADR-004) has no `language` column. The add-copy form (criterion 4.5) does not present a language selector — language is set implicitly to EN on insert. The search API returns "EN" as a constant for all results. The UI displays language as part of each result (satisfying criteria 1.6 and 2.3) but the value is always "EN".
  When a future spec introduces non-EN cards, a migration adds a `language` column with a default of "EN" for existing rows, and the add form gains a language selector. This ADR is superseded at that point.
- **Assumptions:**
  - Jonas owns only EN cards in v1. No non-EN card will be added during the v1 lifecycle.
  - Displaying a hardcoded "EN" label satisfies the intent of criteria 1.6 and 2.3 (the user can read the language field; it is not hidden or omitted).
- **Alternatives considered:**
  - **Store language per copy from day one:** adds a column, a form field, and validation. Correct in principle but unnecessary for a single-language collection. Rejected for v1 as over-engineering given the single-user, single-language constraint.
  - **Omit language from display entirely:** would violate criteria 1.6 and 2.3 as written. Rejected.
- **Consequences:**
  - *Easier:* schema stays minimal (no `language` column); add form has one fewer field; no language validation logic needed.
  - *Harder:* when non-EN support is added, existing copy rows must be back-filled with "EN" and the API + form must be updated. A migration spec will own this.
  - *Commits us to:* any v1 copy record implicitly represents an EN card. Importing non-EN cards before this ADR is superseded would produce incorrect data.
- **Source:** conversation with Jonas, 2026-05-05 — confirmed EN-only scope for v1; language display required by criteria 1.6 and 2.3 but value is always "EN".
