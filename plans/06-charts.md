# 06 — Chart evidence and disposition

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

**Scope:** F05/E12, supporting F03/F04 and V01. Preserve the current withheld state until each individual chart is accepted.

## Ownership and independence
Own `CHART-AUDIT.md`, new `workstreams/06/` evidence/data artifacts, and proposed chart modules under `src/features/charts/`. No direct App/global CSS/shared-registry changes. Research can start immediately; final rendering depends on 01 contracts and coordinator/07 integration.

## Tasks
1. Give each of the eleven audit candidates an explicit disposition: reproducible rebuild, sourced conceptual replacement, or remain withheld with reason. Do not treat all eleven restorations as mandatory for the smaller first release.
2. For rebuild candidates, obtain exact dataset/version/locator and permissible reuse terms; record units, denominator, date/frequency, scope, method, revisions and uncertainty. Include a reproducible transform with retrievable inputs, not a manually transcribed unexplained series.
3. Keep legal gold/silver ratios apart from market ratios; denominations apart in silver-content examples; parity/peaks/averages apart in prices; debt stock apart from flows and fiscal years apart from calendar dates; rescue authorizations apart from net costs; COFER apart from broad reserves. Country counts require an explicit roster and inclusion rule.
4. Prioritize a small defensible subset if evidence exists. Supply accessible data tables, plain-language interpretation, units/period/source captions, and uncertainty. Record independent source totals or known values for package 10 to test later; design conceptual illustrations without implying numeric magnitudes.
5. Review causal captions separately from numerical reproduction. Send approved observations/source packets to 01 and chart placement to 07. Keep unavailable data withheld and document what would unlock it.

## Done when
All eleven candidates have evidence-backed dispositions; every restored chart is reproducible and has an accessible alternative, with independent review recorded. If none qualify, deliver a completed disposition report and retain withholding. That can close the smaller release's unsafe-chart issue without claiming completed datasets. Deliver `workstreams/06/HANDOFF.md` and any unresolved dataset/licensing limitations.
