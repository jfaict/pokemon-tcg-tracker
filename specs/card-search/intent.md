# Intent: Card Search

> One-page document. Written by Jonas + Claude. The upstream artifact for everything else.

## Vision

A collector standing in a shop can type a card name and know within 3 seconds whether they already own it, how many copies, and whether their existing copy is worth upgrading.

## Problem

1. **What were you trying to do when you felt the pain?**
   Deciding in-store whether to buy a single — without a fast way to check existing ownership or copy quality. The pain crystallised when you bought a Charizard ex single, came home, and found the same card already sitting in a forgotten binder.

2. **What is the actual friction, stripped of any proposed fix?**
   A 600-row spreadsheet is too slow and unwieldy to consult while standing in a shop. It can't answer "do I have this, and is my copy worth upgrading?" in the time the decision requires.

3. **What would "solved" feel like?**
   You see a card in the shop, type its name, and within 3 seconds you know: how many copies you own, where they are, and the condition of each — enough to decide buy / skip / upgrade on the spot.

## Success criteria

- A card name search returns results in under 3 seconds on a mobile browser with a normal 4G connection.
- Results show: copy count, location (binder/box label), and condition per copy.
- Jonas uses the search at least once per shop visit without opening a spreadsheet.
- Buying a duplicate becomes a deliberate choice, not an accident.

## Non-goals

- Social features or trade matching with other collectors.
- Decklist builder.
- Support for non-Pokémon TCGs (deferred, not banned — data model must not bake in EN-only or single-game assumptions).
- Photo recognition / OCR of binder pages (explicitly flagged as v2+).
- Collection valuation (nice-to-have, not the main point of this feature).

## Open questions

1. Which card search API provides name → set + collector number lookup reliably and for free? (Cardmarket, PokémonTCG.io, or other?)
2. How does Jonas enter cards into the tracker in the first place? Bulk import from spreadsheet, manual entry, or barcode/scan? (This feature assumes data already exists — but the entry flow must be designed before this is useful.)
3. What exactly counts as "location"? Binder name? Binder + slot? Box label? How granular does Jonas want to go?
4. Should condition use a standard scale (NM / LP / MP / HP / DMG) or free text?
5. Is "first edition" / print run a required field, or out of scope for now?

## Technical hints *(for `/design` to consider)*

- Card identity is set + collector number, not just name. Multiple printings of the same card exist.
- Language (EN, JP, etc.) must be a field — Jonas only has EN now but the data model should not assume it.
- Condition is per-copy, not per-card — a card can have multiple copies at different conditions.
- Pricing data sources mentioned: Cardmarket, PokémonTCG API. Not resolved here.

## Source material

- [`intake/2026-04-15-brainstorm.md`](../../intake/2026-04-15-brainstorm.md)
- [`intake/2026-04-18-voice-memo-transcript.md`](../../intake/2026-04-18-voice-memo-transcript.md)
- [`intake/2026-04-22-youtube-grading-notes.md`](../../intake/2026-04-22-youtube-grading-notes.md)

## Conversation references

*(none yet)*
