# Changelog

## 2026-05-05 — Card Search (v1)

**New feature:** Search the full Pokémon TCG card catalogue by name and manage your collection inline.

- Search the card catalogue by partial name (case-insensitive). Results appear within 3 seconds of the last keystroke. ([ADR-001](../decisions/card-search/ADR-001-use-pokemontcg-io-as-card-catalogue.md) — pokemontcg.io selected as catalogue source.)
- Search is proxied through a server-side API route; the catalogue API key is never exposed to the browser. ([ADR-002](../decisions/card-search/ADR-002-proxy-pokemontcg-via-api-route.md))
- Access is gated by a passphrase. ([ADR-003](../decisions/card-search/ADR-003-stub-auth-with-env-passphrase.md))
- Owned copies are stored in a local database table with condition, storage location, and a unique copy ID per physical card. ([ADR-004](../decisions/card-search/ADR-004-copies-table-schema.md))
- Each search result shows copy count, copy condition, and storage location inline — no separate screen.
- Unowned cards (0 copies) show an "Add to collection" button. Tapping it opens a condition + location form; on save the count updates without a page reload.
- Error states: no-results message, search failure banner with retry, DB-read error (distinct from zero-copy), rate-limit message, 20-result refine prompt.
