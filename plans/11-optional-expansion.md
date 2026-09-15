# 11 — Optional P2 packages

## Execution order — edit first, test once afterward

Complete all assigned content and implementation edits without pausing to write or run tests, rebuild for validation, or perform browser/accessibility/performance checks. Continue directly through the full assigned scope. Source research needed to write accurate content remains part of editing. Record potential test cases briefly in the handoff; do not implement them now. Any testing or acceptance checks described below belong to package 10, after all content edits and shared integration are complete. Mark the editing handoff **edited, testing deferred**; passing checks are not a prerequisite for handing off or starting the next editing package.

These remain in the original plan but are **not first-release blockers**. Select after P0/P1 gates and observed reader needs. Each can be assigned to a different agent once shared schema/component contracts exist. Use isolated feature directories and `workstreams/11-<letter>/HANDOFF.md`; coordinator owns routing/model integration.

| Package | Scope and owned feature directory | Prerequisites | Acceptance |
|---|---|---|---|
| 11-A | V03 country cases + D08 timeline filters; `src/features/countries/` (timeline filter integration coordinated with 05) | Reviewed 04 legal/ownership evidence and 05 event geography/type data | El Salvador, CAR, US federal/state, Bhutan and Czech test have instrument/status/effective date/adoption form/provenance/outcomes/confounders/uncertainty; proposed law, mining, seizures and actual reserves remain distinct. Geography/arrangement/type filters retain overview/all-events and shareable state |
| 11-B | V04 crisis explorer; `src/features/crises/` | Reviewed historical mechanisms from 02–04 | 1907/crypto lender runs, 1997 mismatch, 2008/stablecoin stress and gold-standard debt-deflation/BTC scenario compare trigger, exposure, transmission, loss bearer, safeguard and limits. Hypothetical BTC macroeconomy is visibly a model, not an observed event |
| 11-C | V05 evidence dashboard + V09 privacy/Zcash agenda; `src/features/evidence/` | 01 observations, 04 conclusion/revision criteria | Every indicator has dated baseline, direction, uncertainty and revision trigger, with named maintenance owner. Privacy agenda separates research questions from findings and defers any Zcash verdict until dedicated evidence exists |
| 11-D | V06 interactive bimetallism and balance sheets; `src/features/simulations/` | 02 bimetallism assumptions; 03/07 reviewed mechanics | Inputs/assumptions visible, balance sheets reconcile, legal versus market ratios distinct, keyboard operable and equivalent noninteractive explanation present. Test economic invariants and edge cases |
| 11-E | R13 progress/bookmarks/print/guides + V08 comprehension checks; `src/features/learning-tools/` | 07 reader and 08 paths | Local resume/bookmarks with reset and clear storage behavior, readable print/download guides, and checks explaining reserve asset/unit of account, custody/control and authorization/settlement. Preserve route IDs and privacy |
| 11-F | V07 matched historical comparison; `src/features/returns/` | Licensed/reusable datasets and 06 reproducibility conventions | Common dates/currency, disclosed fees/inflation method, price versus total return, drawdown/recovery and missing-data conventions; no forecast or universal asset-ranking score. Withhold if comparable data or reuse rights are unavailable |

## Suggested parallel dispatch

After first release, A/B/E can run concurrently with a coordinator. C/D/F form another independent wave once their evidence is accepted. These are separate product choices, not permission to accumulate all six while core release work remains unfinished.

Each agent delivers sourced inputs, isolated implementation, meaningful validation, maintenance cost/owner and remaining uncertainty. Updating shared evidence definitions or routes requires the same single-writer integration process as the first release.
