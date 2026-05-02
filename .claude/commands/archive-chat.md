---
description: Save the current conversation as a transcript in conversations/ so ADRs can link to it as Source
argument-hint: <slug-or-topic>
allowed-tools: Write, Bash(date:*), Bash(mkdir:*)
model: haiku
---

# /archive-chat — save this chat as a citable transcript

Decisions made in conversation are easily lost. This command saves the current chat to `conversations/` so ADRs can link to it via the `Source` field.

## Arguments

- `$1` — short slug describing the topic, e.g. `card-data-source`. Required.

## What to do

1. **Compute the filename:** `conversations/<YYYY-MM-DD>-$1.md`. If the file already exists, append `-2`, `-3`, etc.

2. **Write the transcript** with this structure:

   ```markdown
   # <Topic, human-readable>

   - **Date:** <ISO date>
   - **Participants:** <user name>, Claude Code
   - **Related artifacts:** <best-guess list of specs/ADRs this chat touches — leave a TODO marker if unsure>

   ---

   ## Summary

   <3–6 bullet points capturing the *decisions* and *open questions* from the chat. Not a play-by-play.>

   ---

   ## Transcript

   <verbatim message exchange — user turns prefixed with **User:**, assistant turns with **Claude:**>
   ```

3. **Capture only what's in the current turn buffer** that you can see. If the conversation is long and the early turns have been compacted, note this honestly with `<!-- earlier turns summarised by /compact, not verbatim -->` and provide whatever summary you have.

4. **Print the saved path** and remind the user this is now linkable as `Source` from any ADR. Suggest: "If this chat produced any decisions, run `/adr <slug>` and link this transcript."

## Quality bar

- Verbatim where possible. Paraphrasing destroys the evidence value.
- Summary section captures decisions + open questions, not narrative.
- Filename is dated and slugged so it sorts naturally.

## Anti-patterns to refuse

- Editorial cleanup of the user's words. Preserve them as written.
- Skipping turns that "weren't important." Decisions hide in the casual exchanges.
- Writing a summary without a transcript. The transcript is the evidence; the summary is convenience.
