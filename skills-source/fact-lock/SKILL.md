---
name: fact-lock
description: Enforces strict source-grounding and citation discipline for non-fiction, research-based, educational, or fact-dependent writing and software content -- the inverse discipline of creative worldbuilding. Use whenever a user is writing a non-fiction book, research report, educational curriculum, technical documentation, or any software/product content requiring domain-accurate facts (medical, legal, scientific, financial, historical). Trigger on phrases like "help me write this research-based," "make sure this is accurate," "cite your sources," "don't make anything up," "this needs to be fact-checked," or any request to produce factual content for a real-world audience or product. Always run the setup interview before producing content for a new project -- confirm source material, citation style, and how to handle gaps before writing anything.
---

# Fact Lock

A skill for producing non-fiction, research, educational, or fact-dependent content where the entire value of the output depends on every claim being traceable to a real source -- never invented, never a plausible-sounding guess, never a fabricated citation.

## The core principle

This is the mirror image of a fiction world bible. In fiction, canon is something the author builds and Claude enforces alongside them. In fact-based work, the "canon" already exists independently, in the real world, and Claude's job is to represent it accurately and cite it honestly -- never to fill gaps with fluent-sounding invention. The single most dangerous failure mode this skill exists to prevent is hallucination: a confident, well-written, entirely fabricated statistic, quote, study, or citation. Fluency is not evidence of accuracy. Every sentence that states a fact needs a real source behind it, or it does not belong in the output.

## Step 1 — The setup interview (mandatory for any new project)

Before producing any content, ask the user:

1. **The project** — what is being written (non-fiction book, report, curriculum, technical docs, software content) and its subject/domain.
2. **Source material** — what has the user already provided or will provide (uploaded documents, a defined reading list, specific URLs or datasets)? Is there an existing corpus to treat as primary, or does this start from nothing?
3. **Sourcing mode** — confirm the default is hybrid: primary reliance on the user's own provided material, with web search used only to fill gaps the material doesn't cover, and every web-sourced fact clearly flagged as externally verified rather than blended in silently. Ask if the user wants this tightened further to closed-corpus-only (no web search at all, even to verify) or loosened to fuller open verification.
4. **Citation style** — inline citations, footnotes, endnotes, a specific style guide (APA, MLA, Chicago, IEEE), or an informal but consistent in-text format. Ask rather than defaulting.
5. **How to handle gaps** — when a needed fact isn't in the provided material and isn't reliably verifiable, should Claude (a) omit the claim entirely, (b) flag it plainly to the user as a gap needing their input, or (c) mark it visibly as unverified within the draft itself. Most rigorous non-fiction work wants (a) or (b) as the default.
6. **Synthesis tolerance** — how much interpretive connection-drawing across sources is acceptable (e.g., "these two studies together suggest X")? By default, any synthesis beyond what a source explicitly states must be clearly labeled as interpretation, separate from cited fact, and should be treated as provisional until the user reviews it — never presented with the same confidence as a directly sourced claim.

## Step 2 — Build the project's governance document

From the interview, generate a project-specific instructions document (see `references/fact_lock_instructions_template.md`) covering the confirmed sourcing mode, citation style, gap-handling rule, and synthesis-labeling rule in the user's own terms. Save this as an actual file and treat it as binding for the rest of the project.

## Step 3 — The Source Lock, applied literally

- **Never state a specific fact — a statistic, date, name, quote, study finding, or figure — without a real, checkable source behind it.** If you cannot locate the source, do not include the claim, even if it sounds plausible or is something you believe to be generally true. Trained knowledge of well-established, uncontested facts (basic historical dates, settled science) can be used but should still be verified via search if the project's rigor calls for it, and should never be presented with invented specificity (a plausible-sounding but unverified statistic is worse than no statistic).
- **Never fabricate a citation.** Do not invent a study name, author, page number, journal, or URL to make an unsourced claim look sourced. If a real source can't be found, say so plainly rather than manufacturing one.
- **Distinguish three tiers explicitly whenever a document mixes them:** material drawn directly from the user's provided corpus (cite precisely — document, page/section if available); material found via web search to fill a gap under hybrid mode (cite the source found, and flag clearly that it came from outside the user's own material); and Claude's own interpretation or synthesis connecting multiple sources (label this explicitly as interpretation, never presented as an established fact).
- **Maintain a source registry** (see Step 4) — a running, auditable list of every source actually used, updated every time new material enters a draft.
- **Flag gaps rather than filling them.** If the user's material and available search both come up short on something the content seems to need, say so directly and ask, rather than writing around the gap with something unstated but plausible.
- **For software/product content specifically**, treat the stakes as higher, not lower — factual content shipping in a real product (health information, legal guidance, financial figures, educational claims) affects real users, and any unverified claim should be flagged for explicit human review before it's treated as ready to ship.

## Step 4 — The source registry

Maintain a running document listing every source used in the project: title/author/publication or URL, date accessed or published, and which specific claims in the working draft depend on it. This is the audit trail that lets the user (or anyone else) verify the finished content claim by claim. Update it every time a new source enters the draft — never let it fall out of sync with the actual content.

## Step 5 — Drafting discipline

- Before writing any sentence containing a specific factual claim, check: is this directly supported by provided material? If yes, cite it. If not, is web verification appropriate under the confirmed sourcing mode? If yes, search, verify, and flag it as externally sourced. If neither, do not write the claim — flag the gap instead.
- Never pad thin research with plausible-sounding invented specificity to make content feel more complete or authoritative. A shorter, fully-sourced section is always preferable to a longer one padded with unverified claims.
- When synthesizing across multiple sources, keep the synthesis visibly separate from the sourced facts it's built from (a clearly marked "interpretation" or "analysis" passage, not blended sentence-by-sentence with cited claims in a way that obscures which parts are fact and which are inference).

## What this skill is not

It is not a research-generation tool that produces sources on demand, and it is not a style guide for non-fiction prose. It does not decide what's true — the user's provided material and verifiable outside sources do. Its entire job is making sure nothing enters the output that those sources don't actually support, and making that support checkable at every step.
