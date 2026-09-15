# 07 — Homepage and reading experience

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

**Scope:** R01–R12 presentation, R02/R03 narrative consistency, F07 methods presentation and completion of V02. R08/R11 prose comes from 02–04; R12 canonical terms from 08.

## Ownership
Audit current UI immediately. Implement in `src/features/reader/` and `src/MoneyMechanics.jsx` after coordinator grants the feature boundary. Use scoped CSS; request App/global style/model/prerender changes through 00. Do not rewrite chapter prose or evidence records owned by editors.

## Tasks
1. Complete the original homepage sequence: clear entry actions, money functions, question cards, comparison preview, short overlapping history, three volume cards/reading commitments, paths, evidence/unresolved distinction and methods. Reuse approved metadata instead of copying facts into JSX.
2. Preserve all eleven arc stages, interwar bridge and distinct Bitcoin/stablecoin development. Integrate chapter-to-arc corrections supplied by editors; retain withheld-chart notices unless 06 approves specific replacements.
3. Establish readable type/spacing and textual volume cues in both themes. Validate approximately 60–75-character reading width where appropriate. Complete compact header, named History navigation and visible chapter/progress/contents controls at 320/390/768 px and desktop.
4. Render accepted question/short answer/takeaways/evidence summaries before topic prose. Add curated prerequisite/deeper/counterargument/case links with reasons. Reference documents retain suitable reference layouts.
5. Complete keyboard/touch contents behavior, collapse controls, visible focus, sticky-header offsets, section deep links and back/reading-position restoration. Inventory nonstandard file references and propose explicit chapter/section links; preserve scholarly IDs and existing aliases.
6. Finish inline glossary mobile/focus behavior using canonical entries from 08; retain Escape restoration, close control and full-entry navigation. Check interaction with selection tools and collapsed sections.
7. Validate the four £100 mechanics scenarios with 03 and on small screens/keyboard/screen reader. Preserve balance-sheet distinctions and noninteractive explanations; new simulation controls belong to P2 V06.
8. Present verified attribution, revision history and corrections workflow from 00/10. Do not invent an author/editor when attribution is unavailable.

## Done when
Reader tasks work on home, History, topic and reference pages at required widths in both themes; summaries and citations agree with static output after integration. Defer keyboard/touch, assistive-technology and screenshot checks to package 10. Deliver the full implementation, deferred check list, shared-file requests and `workstreams/07/HANDOFF.md` to 00/10.
