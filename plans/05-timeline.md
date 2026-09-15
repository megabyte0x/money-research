# 05 — Timeline relevance and chronology

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

**Scope:** F06/D07; coordinate historical/dated claims with 02–04. D08 filters are deferred to 11-A.

## Ownership and baseline
Own the three published timeline Markdown files, `public/content/timeline-event-ids.json`, `src/timeline-references.js`, `src/timeline.js`, dedicated timeline tests and `workstreams/05/`. Coordinator owns manifest regeneration and UI wiring. No volume editor edits these files concurrently.

Baseline: Gold 90 rows/88 mappings; After Gold 120/43; Bitcoin 101/0. There are 180 unmapped rows and five reviewed shared-event pairs. Recount after any split or withdrawal.

## Tasks
1. Produce a row-level coverage report with stable ID, display date, proposed start/end/precision, composite status, destination, relevance rationale, evidence and disposition. Start with the 101 Bitcoin and 77 After Gold gaps plus two Gold gaps; verify existing links again after chapter edits.
2. Read destination bodies before adding relationships. If no chapter discusses the specific event, retain a **reviewed** source-timeline fallback with a reason; do not map merely to achieve 100% chapter-link coverage. Track reviewed fallbacks separately from unreviewed rows.
3. Split unrelated composite events, retain original IDs for surviving events and allocate new IDs without renumbering or reuse. Follow `TIMELINE-EDITORIAL.md`; update row keys when wording/date changes, preserving durable IDs. Consume editor correction requests.
4. Define explicit sortable ranges and precision for ancient/approximate dates. Document BCE/no-year-zero convention; avoid pretending midpoint approximations are exact event dates. Coordinate model extension with 01/00 instead of editing shared build code concurrently.
5. Audit cross-volume overlap event by event. Add only confirmed same-event relationships, preserve all source lanes/references and explain which display text survives. Keep February 1973 devaluation separate from March floating; retain original bad-link regression examples.
6. Record coverage, date/range behavior, IDs, duplicates and relevance cases for package 10; do not write or run tests during timeline editing. Update editorial documentation and send accessible UI needs to 07/00.

## Done when
Every current row has a review disposition; no unrelated bundled row or false duplicate remains unexplained; all published destinations have checked relevance and resolve after final chapter integration. Package 10 later checks the integrated build for missing/stale IDs. Deliver the coverage report, remaining historical uncertainties and `workstreams/05/HANDOFF.md`; tests alone cannot certify relevance.
