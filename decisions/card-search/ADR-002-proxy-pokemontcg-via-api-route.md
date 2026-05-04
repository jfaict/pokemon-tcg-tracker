# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-002 · Proxy pokemontcg.io calls through a Next.js API route

- **Date:** 2026-05-04
- **Status:** accepted
- **Type:** technical
- **Context:** The card search feature must query pokemontcg.io for card catalogue results. The pokemontcg.io API requires an API key. The search also needs to be merged with Turso collection data before returning to the UI — both calls must be coordinated somewhere.
- **Decision:** pokemontcg.io is called server-side from a Next.js API route (`/api/search`), not directly from the browser. The API route fetches catalogue results and collection data, merges them, and returns a single JSON response.
- **Assumptions:**
  - Vercel serverless function cold starts will not push the server-side P95 round-trip above 500 ms in practice.
  - The pokemontcg.io API key fits in a Vercel environment variable (it does — it is a short string).
  - A single merged response is simpler for the UI than two parallel client-side fetches.
- **Alternatives considered:**
  - **Direct browser call to pokemontcg.io:** eliminates the serverless hop, but exposes the API key in the browser (visible in network inspector). Rejected on security grounds.
  - **Two separate client-side fetches (pokemontcg.io + /api/copies):** no key exposure issue if pokemontcg.io supported CORS without a key, but merging two async responses client-side adds complexity and two round-trips. Rejected for simplicity.
- **Consequences:**
  - *Easier:* API key stays server-side; future server-side caching of catalogue responses is trivial to add; a single fetch from the UI reduces state complexity.
  - *Harder:* one extra network hop (browser → Vercel → pokemontcg.io) adds latency; must stay within the 500 ms server-side budget (ADR-001 assumption).
  - *Commits us to:* running the catalogue lookup as a serverless function on every search; if pokemontcg.io is slow, the user feels it.
- **Source:** derived from `specs/card-search/design.md` — no separate conversation; decision follows directly from API key security requirements and the proxy pattern standard for Next.js apps.
