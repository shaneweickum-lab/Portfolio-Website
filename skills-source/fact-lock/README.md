# Fact Lock

A Claude skill for producing non-fiction, research, educational, or fact-dependent content where every claim has to survive being checked — no invented statistics, no fabricated citations, no plausible-sounding gaps quietly filled in.

---

## What this actually solves

The most dangerous failure mode in AI-assisted factual writing isn't obvious errors — it's confident, fluent, entirely fabricated specifics: a statistic that sounds exactly right, a quote attributed to someone who never said it, a citation to a study that doesn't exist. Fluency reads as authority, but fluency is not evidence. This skill exists to break that connection — to make sure every specific claim in the output can be traced back to something real, and that anything that can't be traced gets flagged instead of quietly smoothed over.

This is the mirror image of a creative worldbuilding skill. In fiction, the goal is internal consistency with canon the author invented. Here, the "canon" is the real world, and the job is representing it honestly rather than filling gaps with invention.

## How it works

Before producing content for a new project, the skill runs a setup interview: what's being written, what source material already exists, how sourcing should work, what citation style to use, and what happens when something needed isn't actually covered by any available source.

The default sourcing mode is **hybrid**: your own provided material — uploaded documents, a defined reading list, whatever corpus you bring — is treated as the primary authority. Web search is used only to fill gaps that material doesn't cover, and anything found that way gets flagged explicitly as externally verified, never blended in as if it came from your own sources.

From there, every piece of content follows the same rules:

- **No specific fact without a real, checkable source.** Statistics, dates, quotes, study findings, names — all of it needs a citation, every time.
- **No fabricated citations, ever.** If a source can't be found, the claim doesn't go in. A missing fact is always better than an invented one.
- **Three tiers, kept visibly separate:** what your own material directly states, what web search found to fill a gap (flagged as such), and Claude's own interpretation connecting sources (labeled as analysis, never presented with the confidence of a direct citation).
- **A live source registry** tracks every source actually used and what specific claims depend on it — an audit trail you or anyone else could use to verify the finished content claim by claim.
- **Gaps get flagged, not filled.** If something the content needs isn't in your material and isn't reliably verifiable, you hear about it directly rather than getting something plausible-sounding instead.

## Getting started

Tell Claude you're writing non-fiction, a research report, educational material, or fact-based content for a product, and the skill will run its setup interview. Useful to have ready:

- What you're writing and its subject/domain
- Any source material already gathered — upload it, or describe what you plan to use
- A citation style preference, or confirmation that an informal but consistent format is fine
- A preference for how gaps should be handled (flagged, omitted, or marked inline)

## Use cases

**A non-fiction author working from a defined set of sources.** Upload your research material once, and every chapter gets checked against it — with a running registry showing exactly which claims come from where, so nothing quietly drifts from what your sources actually say.

**An educator building curriculum content.** Fact-based teaching material carries real consequences if it's wrong. The skill treats every factual claim the same way regardless of how confident it sounds, flagging anything it can't verify rather than letting a plausible-sounding but unsupported claim into a lesson plan.

**A software team building a product with domain-accurate content.** Health information, legal guidance, financial figures, scientific claims embedded in an app carry higher stakes than a book chapter. The skill explicitly tightens rather than relaxes its discipline once content is headed for a real product, and recommends a human expert review pass for anything not fully nailed down before it ships.

**A researcher synthesizing across multiple sources.** The skill will help you draw connections across your material, but keeps that synthesis clearly separate from directly cited fact — so you always know which parts of your own draft are established and which are your own interpretation, still needing your review.

## What this skill won't do

It won't invent sources to make thin research look complete, and it won't relax its citation standard because a deadline is close or a section feels short. A shorter, fully-sourced piece of writing is always the right tradeoff against a longer one padded with unverified claims. It also won't decide what's true on its own — your provided material and verifiable outside sources do that. Its job is making sure nothing in the output goes further than what those sources can actually support.
