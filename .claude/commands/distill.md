---
description: Phase 0 — turn rough notes, voice memos, and brainstorms in intake/ into a clean intent.md
argument-hint: <feature-slug> [intake-files...]
allowed-tools: Read, Write, Glob, Grep, Bash(ls:*), Bash(mkdir:*)
model: sonnet
---

# /distill — capture rough input into a clean intent

You are running **Phase 0 (Capture)** of the spec-driven workflow. Your job is to turn unstructured human input into a one-page `intent.md` that the rest of the pipeline can build on. **You will not produce requirements, designs, or task lists in this phase.** If the user pushes for those, defer them to `/spec`.

## Arguments

- `$1` — the feature slug (kebab-case, short). Required. Example: `card-search`.
- `$2..$N` — optional list of intake files to consume. If omitted, read **all** files in `intake/` whose name or content references the slug, plus any unfiled notes the user mentions in this turn.

## Inputs to read

In this exact order, and **only** these:

1. `memory/constitution.md` — to know what is and isn't on-brand for this project.
2. `intake/` files matching the slug or passed explicitly as arguments.
3. Anything the user pasted into this turn.

Do **not** read existing specs, ADRs, or code. Distillation is upstream of all of that.

## What to do

1. **Triage the rough input** with these three questions. Print them back to the user with your best-guess answer drawn from the input, then ask them to confirm or correct each one before you write anything:
   1. *What were you trying to do when you felt the pain?*
   2. *What is the actual friction, stripped of any proposed fix?*
   3. *What would "solved" feel like, regardless of how it gets built?*

2. **Wait for the user's confirmation or corrections.** Do not skip this — the entire pipeline downstream is calibrated on these answers.

3. **Write `specs/<slug>/intent.md`** using the template at `templates/00-intent.md`. Required sections, in this order:
   - `Vision` — one sentence.
   - `Problem` — three short paragraphs answering the triage questions, in plain language.
   - `Success criteria` — measurable, behavioural, no vanity metrics.
   - `Non-goals` — what this is explicitly *not*. Pull these from rejections or "not now" comments in the intake.
   - `Open questions` — anything the input couldn't settle. These become the agenda for `/spec`.
   - `Source material` — relative links to every intake file you consumed.
   - `Conversation references` — relative links to any chat transcripts in `conversations/` that the intake cites.

4. **Create the spec folder** if it doesn't exist (`specs/<slug>/`).

5. **Do NOT** write `requirements.md`, `design.md`, ADRs, or code. Even if the intake contains tech details, capture them as "Technical hints (for `/design` to consider)" at the bottom of `intent.md` and stop there.

6. **Print a short summary** to the user:
   - Path to the new file.
   - Top 3 open questions you couldn't resolve.
   - Suggested next command: `/spec <slug>`.

## Quality bar

- One page. If `intent.md` exceeds 400 words, you are over-specifying.
- Plain words. No jargon, no acronyms the user didn't already use.
- Every claim traceable to a line in the intake — if you can't cite the source, leave it out.
- The `Vision` sentence has to make sense to someone who has never seen the intake.

## Edge cases

- **No intake files for this slug.** Ask the user for a 2-minute brain-dump. Capture it verbatim into `intake/<slug>-<date>.md` first, then proceed with distillation.
- **Conflicting intake files.** Surface the conflict in `Open questions` rather than picking a side.
- **Intake files in Dutch / another language.** Keep `intent.md` in the project's working language (English by default), but preserve original quotes inline where they sharpen the meaning.

After you finish, the next phase is `/spec $1`.
