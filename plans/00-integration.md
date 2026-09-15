# 00 — Coordination and integration

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

## Objective
Preserve the working preview, enable conflict-free parallel work, and reconcile the final first-release state. Own T01/F02 preservation, shared integration and release status.

## Tasks
1. Record the actual starting revision, dirty files and active writers before dispatch. Preserve untracked `src/sources.js` and `public/content/sources.json`; compare and integrate deliberately. Do not auto-clean the tree.
2. Confirm `public/content/` is the active editorial source and document `project/` as archival. Keep original source provenance and all 44 stable IDs/routes/aliases. Inventory content divergence before any later consolidation; never copy archival prose over corrected public text.
3. Execute 01 or grant its agent an explicit shared-file lease. Freeze minimum data contracts before downstream integration. Record contracts in `workstreams/00/CONTRACTS.md`.
4. Extract feature boundaries from the class-based `App.jsx` before concurrent UI edits: reader/home/History, discovery/search/glossary, comparison. Specify props and callbacks for parsed model, article/section navigation, query state and glossary access. Preserve behavior in this extraction; avoid a framework migration. Integrate lazy loading where it improves measured initial loading, with accessible loading/error states.
5. Collect the complete editor packets and integrate shared source/claim/observation records. Resolve cross-volume contradictions, then regenerate manifest words/headings once after all content edits, preserving aliases and provenance.
6. Coordinate chapter heading changes with event relationships, copied section URLs, static prerendering and curated reading links. Review proposals from other owners rather than allowing competing shared-file edits.
7. Reconcile E01–E30 in a claim-disposition matrix: correction/qualification/withholding, evidence, affected views, reviewer and remaining work. Do not reset already-reviewed work merely to reimplement it.
8. Update `IMPLEMENTATION-STATUS.md`, `README.build.md`, methods revision history and release notes from demonstrated results. Correct stale documentation such as claims that presentation/content are still carried over verbatim.

## Deferred validation and completion
After all content and implementation edits are integrated, hand off to package 10. Use the actual supported runtime and lockfile for one consolidated validation pass:

```sh
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

Do not run intermediate builds or tests during the editing waves. Retest only failures affected by fixes from the final pass. Final gate report links each original acceptance criterion to evidence or a specific unresolved blocker. Human studies, verified attribution and external indexing cannot be replaced with agent assertions. Deployment is a separate action after release gates and applicable authorization are established.

## Deliverable
`workstreams/00/HANDOFF.md`, contracts, ownership/lease record, complete backlog/claim matrix, integrated source, updated status and an evidence-backed release decision. Finish only when there are no unexplained gaps between package handoffs and global status.
