---
name: fiction-world-bible
description: Sets up and maintains canon consistency, timeline discipline, and prose-quality standards for an author's original long-form fiction project — a novel, series, or fictional world built with Claude across many sessions. Use whenever a user is writing their own original story with Claude, wants a "world bible" or "canon" kept and enforced, asks Claude to draft chapters for their fiction, mentions keeping a story consistent, wants help planning a multi-book series, or is building characters/places/lore for a novel. Trigger even without the words "world bible" or "canon" — phrases like "let's keep writing my story," "does this contradict what we established," "add this to the story's history," "let's plan book two," or "help me build this character" all apply. Always run the setup interview before generating any canon documents for a new project — never default to a generic template without asking first.
---

# Fiction World Bible

A skill for running the canon-governance and prose-discipline system that keeps a long-form original fiction project internally consistent across many sessions, many documents, and (optionally) many books — without ever homogenizing the author's own voice or genre into a generic template.

## The core principle

This skill is a *process*, not a *style*. It does not impose a genre, a tone, or a set of tropes. It imposes discipline: canon that's locked until the author explicitly changes it, a firm line between "what's established" and "what Claude is inventing on the fly," and prose-quality rules the author sets for themselves rather than rules baked into the skill. Never generate a genre-generic world bible template and hand it to the author — always run the interview first, because the entire value of this skill is that it fits the author's actual project rather than reshaping their project to fit a template.

## Step 1 — The setup interview (mandatory for any new project)

Before creating a single canon document, ask the author about their project. Use a tool that presents tappable options if one is available (this is often faster on mobile), otherwise ask directly in text. Cover at minimum:

1. **The project itself** — title (or working title), genre, format (standalone novel, series, how many planned books if known), and a one-or-two-sentence premise.
2. **Existing material** — do they have existing notes, an outline, or lore already written that should be imported as the seed of canon, or are they starting from nothing?
3. **Canon strictness** — how tightly do they want canon locked? Offer a spectrum rather than assuming: (a) strict — nothing enters canon without an explicit "add that to canon" from the author, Claude flags every gap rather than inventing silently; (b) moderate — Claude can invent minor, non-load-bearing details freely but flags anything structural (new powers, timeline facts, character history); (c) loose — Claude has creative latitude and the author will course-correct as needed. Most authors serious about long-form consistency want (a) or (b); don't assume it for them.
4. **Prose style** — ask about their intended balance of dialogue versus descriptive prose, point-of-view conventions, any words or crutch phrases they want banned or watched for (the way one author banned "specific" and "particular" as hedge words), and whether they have a reference passage or existing chapter that models their voice.
5. **Length targets** — target chapter length (a range, not a hard number — chapters should be allowed to run short or long when the scene calls for it), and target book length if they know it (the standard adult genre-fiction floor is roughly 70,000 words, with most falling between 70k and 120k, but literary and other categories vary — ask rather than assuming this range applies).
6. **Naming conventions for canon files** — offer the pattern this skill defaults to (see below) but let the author override it.

Do not proceed to generate documents until these are answered. If the author says "just start, I'll correct you as we go," that's a valid answer to the strictness question (loose) — proceed, but note that you're doing so on that basis.

## Step 2 — Build the project's own governance document

From the interview answers, generate a project-specific custom-instructions document (see `references/custom_instructions_template.md` for the structure to adapt — do not copy it verbatim, fill it in from what the author actually said). This document should cover, in the author's own terms:

- The canon document list (starts empty or seeded from imported material; grows as the project does)
- The lock: how canon may and may not change, calibrated to the strictness level they chose
- Timeline discipline: any dates, ages, or durations established become binding facts to check future writing against
- Prose style rules specific to their answers (their banned words, their dialogue/description balance, their chapter length range)
- The **minor-character-and-place rule**: any named character, city, or location that appears in prose and seems likely to recur should be folded into canon with genuine backstory and texture — never left as a bare name-only entry, no matter how minor its first appearance. Treat recurring places as characters in their own right: give them history, a reason they feel the way they feel, a relationship to the surrounding world.
- Their length targets (chapter range, book range if applicable)

Save this as its own file and treat it as governing every session going forward. Re-read it at the start of any session working on this project if it's available in context.

## Step 3 — Canon governance in practice

Once the governance document exists, follow it literally:

- **Never invent a new fact silently while drafting prose** if the author chose strict or moderate strictness. If a scene needs a detail the canon doesn't cover — a name, a technology, a historical fact, a timeline detail — stop and flag it plainly before writing it in, rather than deciding it yourself and moving on.
- **Only the author authorizes canon changes.** When they say something like "let's make that canon" or "add that to the world," that's the trigger to actually edit the relevant document — not before.
- **Canon changes are a distinct act**, never buried silently inside a prose chapter. Edit the actual world-bible document; don't just leave the fact sitting inside chapter text as the only record of it.
- **Timeline checks**: before introducing any date, age, or duration, check it against what's already established rather than estimating fresh. If nothing's established yet, flag that too rather than quietly deciding.
- **The minor-character-and-place rule applies retroactively**: if a character or place recurs a second time without ever having been given real backstory, that's the moment to fix it, not necessarily the first time they appear (a name can be dropped once for color; a name used twice is a character).

## Step 4 — Prose drafting discipline

When actually writing chapters:

- Apply the author's stated dialogue/description balance and banned-word list on every draft, checking before presenting a chapter rather than after.
- Respect the chapter length range as a default, not a requirement — a chapter that naturally wants to run shorter or longer than the target should be allowed to, and the author should be told the actual word count plainly rather than have it hidden.
- If the author has given a reference passage for voice, reread it before drafting anything new, the same way canon gets rechecked.
- Track running word count against any stated book-length target, and when a book is complete but under its target floor, the right response is checking whether some chapter, scene, or thread was left thinner than the story needed — never padding existing prose to hit a number. Say this plainly if it comes up.

## Step 5 — Series and multi-book planning

If the project spans multiple books:

- Keep a separate planning document (distinct from the single-book outline) for anything that spans the whole series — a central conceit that escalates book over book, a technology or magic system's rules, character arcs that need room across multiple books rather than resolving in one.
- Leave real open questions open rather than deciding them for the author. A series planning document should have a section of unresolved questions the author needs to weigh in on, not just a confident roadmap.
- When a book's outline plans a certain number of chapters but the actual drafted chapters leave threads dangling that a single finale chapter can't honestly resolve, that's a legitimate reason to add chapters — filling real gaps, never as an excuse to pad length.

## Step 6 — Companion and external-facing material

If the author wants distilled versions of their world bible for external use (a NotebookLM-style audio companion, a website, a pitch document), strip internal-editorial scaffolding — meta-notes addressed to Claude rather than a reader, "canon addition" labels, author's-notes-for-us-only blocks — while leaving the actual content exactly as raw and complete as it is internally. Never soften spoilers or sensitive plot content for an external audience unless the author asks for that specifically; the point of stripping scaffolding is removing internal bookkeeping, not sanitizing content.

## What this skill is not

It is not a genre template, a plot generator, or a prescriptive style guide. It does not decide what the author's world should contain. It enforces the discipline of keeping whatever they decide consistent, flagged, and genuinely theirs.
