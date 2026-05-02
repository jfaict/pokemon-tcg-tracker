---
description: Append a new ADR to decisions/ with Context, Decision, Assumptions, Alternatives, Consequences, and Source
argument-hint: <feature-slug-or-project> "<short title>"
allowed-tools: Read, Write, Glob, Grep, Bash(date:*), Bash(ls:*)
model: sonnet
---

# /adr — record an architecture decision

ADRs are the project's institutional memory. **Append-only.** Never edit a past entry — if a decision changes, write a new ADR that supersedes the old one.

Format inspired by Michael Nygard's ADRs.

## Arguments

- `$1` — scope: a feature slug (`card-search`) or `project` for cross-cutting decisions.
- `$2` — short title in quotes, e.g. `"use Pokémon TCG API as card source"`.

## What to do

1. **Determine the next ADR number.** List `decisions/` and pick `ADR-NNN` where `NNN` is one greater than the current max. Pad to 3 digits.

2. **Determine the file path:**
   - Feature scope: `decisions/<slug>/ADR-NNN-<kebab-title>.md`
   - Project scope: `decisions/project/ADR-NNN-<kebab-title>.md`

3. **Ask the user the 5 ADR questions**, one at a time. Capture verbatim answers — do not paraphrase:
   1. **Context** — what is the situation? What forces are in play? What problem is forcing the decision?
   2. **Decision** — what did we decide? One sentence, declarative voice.
   3. **Assumptions** — what are we taking as true without proving? Be ruthless. Each assumption is a future failure mode.
   4. **Alternatives considered** — what else did we look at? Brief reason each was rejected.
   5. **Consequences** — what becomes easier? What becomes harder? What does this commit us to?

4. **Find or create the source.** Every ADR has a `Source` field linking to the conversation where it was hashed out:
   - If the conversation happened in this very session, run `/archive-chat` first and link the resulting transcript path.
   - If it happened in another tool (ChatGPT, Claude, a meeting transcript), ask the user for the link or the file path. If they paste raw text, save it to `conversations/<date>-<slug>.md` and link that.
   - If there genuinely was no conversation (rare — you're guessing), set `Source: derived from <upstream artifact>` and cite the spec or intake file.

5. **Write the ADR** using `templates/05-decision-log.md`'s entry format:

   ```markdown
   ## ADR-NNN · <title>
   - **Date:** <today, ISO>
   - **Status:** proposed
   - **Type:** functional | technical | constitutional
   - **Context:** ...
   - **Decision:** ...
   - **Assumptions:** ...
   - **Alternatives considered:** ...
   - **Consequences:** ...
   - **Source:** [conversations/...](relative/path)
   ```

6. **Cross-link from upstream artifacts.** Add the new ADR ID to the appropriate `references` block:
   - Feature ADR → `specs/<slug>/design.md`'s `Trade-offs considered` section.
   - Project ADR → `memory/architecture.md`.
   - Constitutional ADR → `memory/constitution.md`'s version history.

7. **Print a summary**:
   - ADR number and path.
   - Current status (always `proposed` at creation).
   - The user must flip status to `accepted` (or `rejected`) explicitly. **Do not auto-accept.**
   - Files updated to cross-reference the new ADR.

## Quality bar

- The decision sentence reads like a verdict, not a discussion.
- Every assumption is one a future maintainer could **falsify** with evidence (not vibes).
- Alternatives section has at least 2 options, including "do nothing" when applicable.
- Consequences are honest — including the painful ones.
- The `Source` link resolves to a real file. If it doesn't, you're not done.

## Superseding an old ADR

When a new ADR replaces an old one:

1. Run `/adr` as normal for the new decision.
2. In the new ADR, note `Supersedes: ADR-NNN`.
3. Edit the old ADR's status from `accepted` to `superseded by ADR-MMM`. **This is the only allowed edit to a past ADR.** Body content stays intact for historical truth.
4. Update cross-references in `design.md` / `architecture.md` to point at the new ADR.

## Anti-patterns to refuse

- Editing the body of an accepted ADR. Write a superseding ADR instead.
- ADRs without a `Source`. The trail of evidence is the whole point.
- ADRs with empty `Assumptions`. There are always assumptions; you just haven't surfaced them.
- Auto-accepting ADRs in the same session they're created. The human checkpoint is mandatory.
