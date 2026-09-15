# 08 — Search, glossary, paths and synthesis

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

**Scope:** D01–D06; supporting F08/R08/R11/R12/T03. Preserve existing search and URL behavior.

## Ownership and dependencies
Own `src/search.js`, `src/features/discovery/`, dedicated discovery tests, and `workstreams/08/`. Data/canonical-definition inventory can start before UI extraction. Shared model/registries/App changes go through 01/00; glossary prose remains volume-editor-owned until handed off.

## Tasks
1. Inventory duplicate/conflicting terms and create governed canonical definitions with stable IDs, aliases, examples, related terms/chapters and topic tags. Do not keep whichever definition appears first simply because the current model does. Separate dated facts and interpretations into linked evidence notes. Ask editors to resolve substantive conflicts.
2. Extend aliases from reviewed vocabulary and preserve Triffin ranking, QE equivalence, section grouping, volume filters, useful empty states and `#/search?q=…&vol=…` restoration. Record alias collisions, canonical explanations and no-result/back-navigation behavior for the final test pass.
3. Add short titles, tags and volume/category filters to the research index; distinguish topic chapters from directories/timelines/glossaries/sources using explicit metadata. Validate all 44 records remain discoverable.
4. Build five paths: Money basics; Why 1971 mattered; Gold versus Bitcoin; Who controls money; Crises and safeguards. Each gets a learning outcome, ordered chapters/sections, computed reading time and optional branches with rationale.
5. Replace concatenated Takeaways with a roughly five-minute cross-volume synthesis plus volume/topic views and links to full chapter summaries. Replace the 01–09 eligibility filter with explicit content roles so relevant Bitcoin 10–13 summaries are considered. Preserve qualifications and source paths; do not generate unreviewed new judgments.
6. Connect accepted canonical terms/paths/summaries to 01's model, 07's reader and 09's evidence comparison. Use data-derived facts rather than independent literals.

## Done when
Definitions are deliberately chosen and neutral, search regression cases pass, copied URLs and browser Back restore intended state, each path has a validated route/time, and synthesis actually meets its reading-length target without suppressing uncertainty. Desktop/mobile usability still needs 10 verification. Deliver reviewed records, component changes and `workstreams/08/HANDOFF.md`.
