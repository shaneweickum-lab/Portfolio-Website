# Template: Fact-Lock Project Instructions

Adapt this structure from the setup interview — fill in every bracketed section from the user's actual answers. Do not present this template itself; generate their own filled-in file.

---

```
[PROJECT TITLE] — FACT-LOCK PROJECT INSTRUCTIONS
SOURCE GOVERNANCE & CITATION RULES

═══════════════════════════════════════

I. THE PROJECT

[What's being written, subject/domain, intended audience or product context.]

═══════════════════════════════════════

II. SOURCE MATERIAL

[What the user has provided or will provide: uploaded documents, reading list, datasets, URLs. State plainly whether this corpus is treated as primary/authoritative, and note if it's currently empty/being built.]

═══════════════════════════════════════

III. SOURCING MODE

[Default: HYBRID — primary reliance on the user's provided material; web search used only to fill gaps the material doesn't cover; every web-sourced fact clearly flagged as externally verified, never blended in silently with material from the user's own corpus.

If tightened to CLOSED CORPUS: no web search at all, even to verify — only the user's provided material may ever be cited. Any gap gets flagged, full stop.

If loosened to OPEN VERIFICATION: web search may be used more freely to supplement and verify, still always cited, still never blended without attribution.]

═══════════════════════════════════════

IV. CITATION STYLE

[The specific style: APA / MLA / Chicago / IEEE / informal-but-consistent inline / footnotes / endnotes. State the exact format expected so every draft can be checked against it.]

═══════════════════════════════════════

V. GAP HANDLING

[What happens when a fact the content seems to need isn't in the provided material and isn't reliably verifiable:
(a) Omit the claim entirely and move on.
(b) Flag it plainly to the user as a gap needing their input before continuing.
(c) Mark it visibly as unverified within the draft itself, for later resolution.
State which the user chose, or the default combination if they want more than one depending on context.]

═══════════════════════════════════════

VI. SYNTHESIS AND INTERPRETATION

[How much interpretive connection-drawing across sources is allowed. Default: any synthesis beyond what a source explicitly states must be clearly labeled as interpretation, kept visibly separate from cited fact, and treated as provisional until the user reviews it.]

═══════════════════════════════════════

VII. THE SOURCE LOCK

- No specific fact — statistic, date, name, quote, study finding, figure — enters the draft without a real, checkable source.
- No fabricated citations, ever, under any circumstance. If a source can't be found, the claim doesn't go in, and the gap gets handled per Section V.
- Every source-drawn claim gets tiered explicitly when tiers mix in one document: from the user's own corpus, found via web search to fill a gap, or Claude's own interpretation.
- A live source registry (see the accompanying source_registry file) tracks every source actually used, kept in sync with the draft at every stage.

═══════════════════════════════════════

VIII. WHAT THIS DOCUMENT ITSELF IS

A working governance document, not content. Checked before drafting anything new, updated only when the user explicitly changes the sourcing mode, citation style, or gap-handling rule.
```

---

## Companion: Source Registry Template

Maintain alongside the instructions document, updated every time a new source enters the draft:

```
[PROJECT TITLE] — SOURCE REGISTRY

Source | Author/Publisher | Date | Access (URL/ISBN/provided doc) | Claims drawn from it
-------|-------------------|------|----------------------------------|----------------------
[Entry per source, added the moment it's first cited, never after the fact.]
```
