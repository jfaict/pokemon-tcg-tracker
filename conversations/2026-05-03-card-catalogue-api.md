# Card Catalogue API Selection

- **Date:** 2026-05-03
- **Participants:** Jonas, Claude Code
- **Related artifacts:** `specs/card-search/requirements.md` (OQ-1), `decisions/card-search/ADR-001-use-pokemontcg-io-as-card-catalogue.md`

---

## Summary

- The card-search spec left OQ-1 (which external API to use as the card catalogue) unresolved before `/design` could proceed.
- Four candidates were evaluated: pokemontcg.io, TCGdex, PokemonPriceTracker, TCGPlayer (closed).
- **Decision:** use pokemontcg.io as the card catalogue API.
- Key factors: community standard, 20k req/day free tier, TypeScript SDK, reliable uptime.
- TCGdex was a credible alternative but pokemontcg.io has stronger community adoption and reliability track record.
- Jonas confirmed collection is EN-only, making pokemontcg.io's EN focus acceptable.
- Consequence noted: adding non-EN cards in future would require a second API.

---

## Transcript

<!-- Note: this session also covered /constitution, /distill, and /spec for card-search. Only the API selection exchange is transcribed here as it is the decision this archive was created to support. -->

**Claude:** Let's work through OQ-1 together. I'll research available, ideally free, catalogue APIs and suggest the best one.

**Claude:** *(after research)* Here's the comparison focused on catalogue lookup, not pricing:

| | pokemontcg.io | TCGdex | PokemonPriceTracker |
|---|---|---|---|
| Cost | Free (API key) | Free, no limits | 100 req/day free |
| Rate limit | 20k req/day | None published | Too low for practical use |
| Languages | Primarily EN | 14 languages incl. JP | EN + JP |
| Reliability | Battle-tested, 5+ years | Community-sponsored | Commercial SLA |
| TypeScript SDK | Yes | Yes | No |

My recommendation: pokemontcg.io. It's the community standard — well-documented, reliable, TypeScript SDK exists, 20,000 requests/day free. The only limitation is EN focus. One thing to confirm: does your current collection include any non-EN cards?

**User:** it is only EN

**Claude:** pokemontcg.io it is. This is a non-trivial tech pick that needs an ADR per the constitution.

*(ADR questions follow:)*

**Claude:** Question 1 — Context: what is the situation? What forces are in play?

**User:** I need an API to be able to search cards in an external catalogue

**Claude:** Question 2 — Decision: what did we decide? One sentence, declarative voice.

**User:** we decided to go for the pokemontcg.io API

**Claude:** Question 3 — Assumptions: what are we taking as true without proving?

**User:** the free tier is sufficient, and it is ok that it only supports EN cards

**Claude:** Question 4 — Alternatives considered: what else did we look at, and why was each rejected?

**User:** PokemonPriceTracker: the free rate is not sufficient. TCGDex: also good, but pokemontcg.io is the community standard

**Claude:** Question 5 — Consequences: what becomes easier, what becomes harder, what does this commit us to?

*(User asked Claude to suggest an answer. Claude suggested:)*

**Claude:** Easier: implementing card search — TypeScript SDK, good docs, community examples. Getting a free API key is trivial. Harder: supporting non-EN cards in the future — would require switching APIs or adding a second one alongside. Also dependent on third-party uptime. If free tier limits tighten, feature breaks unless caching is added. Commits us to: EN-only catalogue until a second API is introduced, and a hard runtime dependency on pokemontcg.io for every search.

**User:** ok
