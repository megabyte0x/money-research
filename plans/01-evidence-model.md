# 01 — Shared evidence and generated content

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

**Scope:** remaining F03/F04/F08/T03; metadata support for R08/R11/D01–D06/V01.

## Current state
`createContentModel` validates manifest words/headings, resolves five observations, parses blocks/references/glossary, and validates timeline row IDs. Source/claim relationships are not part of that model. Glossary deduplication keeps the first matching label. Existing source-registry files are untracked and unused by the active pipeline.

## Ownership and dependencies
Work under `workstreams/01/` and new dedicated schema modules/tests. Obtain a coordinator lease before editing shared registries, `src/content-model.js`, `src/observations.js`, `src/sources.js`, build scripts or Vite hooks. Editors can research before this package is done; their packets must map into the frozen schema without requiring them to edit shared files.

## Tasks
1. Inspect and preserve the draft registry. Define source records plus claim records with stable IDs, assertion type, scope, exact supporting/contrary locators, review state and dependent article/view IDs. Model sources with genuinely unknown publication dates explicitly; do not invent dates to satisfy validation. Choose URL handling deliberately for legitimate primary documents.
2. Connect observations to actual claim/source records, retaining existing E04/E10 IDs and source information. Validate real calendar dates, units, denominator, method, period, verification and revision; distinguish an observation's period from publication/access date. Reject unresolved references and unverified records entering published factual outputs.
3. Add article metadata for question, short answer, 3–5 takeaways, evidence/uncertainty, topics and curated relation types. Define term/alias and reading-path records with 08; comparison evidence records with 09. Keep values and qualifications derived from shared records.
4. Separate durable explanations from dated current-evidence notes. Preserve provenance and revision history. Generate reader-ready citations, public source links and resolved Markdown from the same accepted model used by prerendering.
5. Populate the five existing observations and their four draft source documents first; then consume editor packets. Provide diagnostics identifying the affected record and field. Record invalid dates, missing source/claim IDs, duplicate IDs, unresolved observation tokens and invalid published status as cases for package 10 to test later.
6. Ensure development rebuild/watch paths include new inputs and that build outputs remain reproducible. Hand coordinator a regeneration procedure for manifest metadata; do not require editors to race on the manifest.

## Done when
A changed accepted observation updates its dependent article/static HTML/summary or home output together; unknown/unverified references fail publication validation; a major displayed conclusion can expose its actual source locator. Full registry coverage is finished only after all accepted editor packets are integrated. Schema infrastructure alone does not close F03/F04.

Deliver contracts, migration notes, implementation and deferred test cases, plus `workstreams/01/HANDOFF.md`. Keep UI wiring requests separate for coordinator integration.
