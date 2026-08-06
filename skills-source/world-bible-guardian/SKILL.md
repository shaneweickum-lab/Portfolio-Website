---
name: world-bible-guardian
description: Checks manuscript prose against a project's world bible (characters, timeline, geography, magic/tech rules, terminology) and flags contradictions before they compound into canon drift. Use when drafting or revising fiction in an established world, or when reviewing a chapter/scene before it's considered final.
---

# World Bible Guardian

DRAFT — this is a starting skeleton, not the author's final version. It
sketches the intended workflow and output shape so the real skill can be
reviewed and refined against it, not a claim of what the finished skill
actually checks or how it actually behaves.

## When to use this skill

Invoke this skill when the user is drafting, revising, or reviewing prose
set in an ongoing fictional world and wants it checked for consistency
against that world's established canon — not for general prose feedback
(pacing, voice, grammar), which is out of scope here.

## Inputs this skill expects

1. **The world bible** — a reference document (or set of documents)
   describing the world's canon: characters (traits, relationships,
   history), timeline/chronology, geography and places, systems (magic,
   technology, politics, culture), and terminology/naming conventions.
2. **The manuscript passage** — the scene, chapter, or draft the user
   wants checked.

If either is missing, ask for it rather than guessing at canon from the
manuscript alone.

## Workflow

1. **Build a working index of the bible.** Read the world bible and hold
   its claims as discrete, checkable facts (e.g. "Kael's left eye is
   scarred, established in Chapter 3" or "the Hollow Reach has no
   functioning magic after the Sundering") rather than treating it as
   unstructured prose to re-read in full on every check.
2. **Extract claims from the manuscript passage.** Identify statements in
   the new prose that touch on anything the bible has an opinion about —
   physical descriptions, ages, relationships, locations, sequence of
   events, rules of magic/technology, names and spellings.
3. **Cross-check each claim against the bible index.** For every extracted
   claim, determine one of three outcomes:
   - **Consistent** — matches established canon.
   - **Contradiction** — conflicts with something already established.
     Cite the specific bible entry it conflicts with.
   - **New canon** — introduces a worldbuilding fact not yet in the bible
     (not necessarily wrong, but undocumented). Flag it as a candidate to
     either add to the bible or revise, and let the author decide.
4. **Report findings**, ordered by severity (hard contradictions first,
   then new-canon flags, then minor/ambiguous items), each with: the exact
   line from the manuscript, the conflicting bible entry (quoted, with its
   source location if known), and — only when a fix is clearly
   unambiguous — a suggested correction that preserves the author's
   voice rather than a generic rewrite.
5. **Never silently "fix" prose.** Flag and explain; let the author decide
   whether a discrepancy is a mistake to correct or a deliberate
   retcon/reveal to canonize into the bible.

## Output format

A short summary line (e.g. "3 contradictions, 1 new-canon flag, 12
passages consistent"), followed by one entry per finding in the format
described in step 4. If nothing conflicts, say so plainly rather than
padding the response with restated context.

## What this skill deliberately does not do

- Judge prose quality, pacing, or style.
- Invent new canon on the author's behalf.
- Assume a fact is wrong just because it's new — new canon is flagged for
  a decision, not treated as an error.
