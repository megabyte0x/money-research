# Remaining implementation: parallel agent plan

Reviewed 15 September 2026 against local commit `7c9939c` and the working tree.

## Updated execution order — content first, testing last

Per the user's revised instruction, complete **all content edits across the volumes, timelines, glossary, summaries, History and comparison**, plus their shared integration, before testing. Agents work through their entire assigned scope without per-chapter, per-batch or per-package test gates. Do not write new tests, run existing suites, perform validation builds, or start browser/accessibility/performance checks during editing waves A–C. Keep source research that is necessary to write accurate content within the editing work.

Regenerate metadata and generated outputs after the full edit set is integrated. Package 10 then performs one consolidated validation pass, with targeted fixes/retests only where it finds failures. Existing test files and validators stay in place. The acceptance criteria below are deferred final checks, not gates that interrupt editing. This timing rule supersedes earlier testing/checkpoint instructions in the original plan and individual briefs.

## What this review establishes

This is an implementation review and task decomposition, not a fresh fact-check of the research or an inspection of the deployed site. Inputs: `../IMPLEMENTATION-STATUS.md`, `../../website-improvement-plan.md`, `../../editorial-change-register.md`, active source/build/test files, `../EDITORIAL-SOURCES.md`, `../CHART-AUDIT.md`, and `../TIMELINE-EDITORIAL.md`. The original backlog remains the specification; this directory assigns its remaining work.

The local build succeeds and generates 44 article pages, numeric aliases, and 45 sitemap entries. After rebuilding, `node --test --test-isolation=none tests/*.test.mjs` passes **43 tests**. These checks establish selected regressions and structural validity, not complete editorial accuracy, browser behavior, accessibility, performance, or indexing.

| Area | Current evidence | Remaining work |
|---|---|---|
| Inventory and publishing | 44 stable records, provenance, legacy aliases; shared parsed content model and static article generation | Preserve these foundations; finish schema, migration documentation and browser checks |
| Evidence | Claim-level prose ledger; five shared observations covering E04/E10 | All other major claims/current figures need disposition, structured relationships and propagation review |
| Source registry | Four records in untracked `public/content/sources.json`; untracked validator `src/sources.js` | Neither is imported by the active builder/model/tests; treat as existing unfinished work, not a completed registry |
| Timeline | 311 durable row IDs; 131 reviewed section mappings; five explicit duplicate pairs | Gold 2/90, After Gold 77/120, Bitcoin 101/101 rows lack mappings: **180 total**. Mapped rows still need date/composite/accuracy review |
| Charts | All eleven former candidates inventoried and withheld; dormant series removed | Dataset review or an explicit retained-withheld disposition for each; no chart is currently approved |
| Search/glossary | Section grouping, Triffin ranking, QE alias, URL/filter restoration; focusable inline glossary | Broader aliases and governed canonical definitions; model currently keeps the first duplicate term by label |
| Reading/synthesis | Short home, eleven-stage arc, provisional comparison, four-transaction mechanics view | Article summaries, paths, index filters, curated next steps, real short synthesis, responsive/accessibility work |
| Takeaways | Existing extraction selects file numbers 01–09 | Review eligibility explicitly: later Bitcoin topic chapters, including the conclusion, are excluded by this filter |
| Delivery | Static metadata, article/section validation; one generated index | Social image absent from prerender code; browser/legacy navigation and external-source validation outstanding. Initial content index is 590,698 uncompressed bytes; that is a size observation, not a performance failure |

No implementation files were changed by this planning task. The two pre-existing untracked files must be preserved. Generated content/build output was refreshed for validation. No remote sync or deployment was performed.

## Work packages

Each linked file is a handoff brief. Read this coordinator document as well as the assigned brief.

| ID | Agent responsibility | Can begin | Main completion dependency |
|---|---|---|---|
| [00](00-integration.md) | Coordinator: contracts, shared files, integration and status | Immediately | All P0/P1 packages for release decision |
| [01](01-evidence-model.md) | Evidence model, sources, observations, metadata generation | Immediately; coordinator can implement | Editor packets to complete record population |
| [02](02-gold-editorial.md) | Gold chapter evidence and summary review | Immediately | 01 for final shared-record integration |
| [03](03-after-gold-editorial.md) | After Gold chapter evidence and summary review | Immediately | 01 for final shared-record integration |
| [04](04-bitcoin-editorial.md) | Bitcoin chapter evidence and summary review | Immediately | 01 for final shared-record integration |
| [05](05-timeline.md) | Complete explicit chronology and event relevance | Inventory now | Edited chapter targets from 02–04 for final links |
| [06](06-charts.md) | Chart disposition, reproducible data and accessible alternatives | Inventory/research now | 01 for data integration; 07 for History UI integration |
| [07](07-reader.md) | Home, History, article navigation, typography and mechanics | Audit/design now | 00 component boundary handoff; 02–04 approved copy |
| [08](08-discovery.md) | Glossary, search, research index, paths and synthesis | Inventory/design now | 01 schema, 00 component boundary handoff, approved editorial packets |
| [09](09-comparison.md) | Cited arrangement comparison | Evidence matrix now | Reviewed 01–06 evidence before final publication |
| [10](10-release-quality.md) | Routes, quality gates, performance, corrections, measurement | After all edits and integration | Full edited content and implementation |
| [11](11-optional-expansion.md) | Separately scoped P2 tools | Planning only initially | P0/P1 release and evidence prerequisites |

“Can begin” permits independent analysis/owned artifacts. It does not permit publishing a dependent view using unreviewed evidence.

## Parallel schedule with four agent slots

Reserve one slot for the coordinator; run at most three worker agents simultaneously. A worker can take another package after handing off its completed work.

| Wave | Coordinator slot | Worker 1 | Worker 2 | Worker 3 | Exit condition |
|---|---|---|---|---|---|
| A | 00 + implement 01 contracts/build seam | 02 Gold | 03 After Gold | 04 Bitcoin | Contracts ready; full volume edits delivered with unresolved claims recorded; no testing |
| B | Integrate evidence; extract UI boundaries | 05 timeline | 06 charts | 08 data/editorial work, then owned UI | Timeline/data edits complete; isolated UI modules handed off; no testing |
| C | Integrate modules, regenerate metadata | 07 reader | 09 comparison | 08 finish | All content and feature edits integrated; no testing |
| D — testing only after A–C | Regenerate once; coordinate consolidated validation | 10 full test pass | Fix failures in assigned modules | Final cross-view consistency checks | Final results and remaining blockers recorded |

Research-heavy packages may continue beyond a wave: start downstream work only for accepted inputs. Do not claim a fixed calendar speedup; source verification and integration remain serial dependencies. On larger teams, timeline/chart editing and research can start in Wave A using their isolated outputs.

## Collision rules and handoff contract

1. **One writer per path at a time.** Separate worktrees are preferable when available, but do not eliminate semantic conflicts. In a shared checkout, respect the ownership rules below strictly. No agent resets, cleans, deletes or overwrites another agent's work.
2. **Coordinator owns shared choke points:** `src/App.jsx`, `src/styles.css`, `src/content-model.js`, `src/md.js`, `scripts/build-content.mjs`, `scripts/prerender.mjs`, `vite.config.js`, `package*.json`, `public/content/manifest.json`, shared source/claim/observation registries, `EDITORIAL-SOURCES.md`, and global status docs. The coordinator can temporarily delegate a named file to 01 or 10, and records when it is returned. No simultaneous lease.
3. **Editors own volume prose only.** Exclude each volume's timeline file, all shared JSON, and generated output. Timeline agent owns the three timeline Markdown files, event-ID registry, `src/timeline.js` and `src/timeline-references.js`. Editors send timeline corrections as handoff requests.
4. **Metadata is a merge step.** Chapter edits invalidate manifest `words` and potentially `h2`. Editors provide proposed metadata in their packet; the coordinator regenerates it before integrated tests. Do not weaken build validation to allow concurrent incomplete inputs. Preserve heading IDs where possible; inventory aliases for deliberate changes before integration.
5. **Keep generated files generated.** Never hand-edit `public/content/index.json`, `public/content/resolved/`, or `dist/`. Keep `project/`, uploads, and the original sibling research volumes as provenance snapshots unless a separate migration is deliberately reviewed.
6. **Isolated outputs:** each worker writes new evidence/proposals under `workstreams/<package-id>/`, with a `HANDOFF.md`. UI workers use `src/features/reader/`, `src/features/discovery/`, or `src/features/comparison/` after the coordinator extracts and assigns boundaries. Scoped styles live alongside those features; global styles remain coordinator-owned.
7. **Evidence packet format:** original E-ID; proposed claim ID; affected article/section; old/new assertion; fact/estimate/interpretation/scenario; scope; source publisher/title/URL/type/dates and exact locator; supporting/contrary evidence; verification/disposition; observation fields where relevant; list of affected summary, glossary, timeline, homepage, comparison and chart locations. Unknown evidence stays unknown. Proposed new IDs use package prefixes until coordinator reconciliation. Existing E-IDs and observation IDs remain stable.
8. **Handoff includes:** files changed, source evidence, remaining unknowns, proposed shared-file edits, deferred test cases and dependencies; mark testing deferred until package 10. A reviewer must be able to distinguish implemented, reviewed, withheld, and blocked work.
9. **Only coordinator updates global completion claims.** A regression test matching wording is not editorial sign-off. A working link is not relevance verification. A successful build is not release approval.

## Coverage of the original backlog

Primary ownership is below; supporting packages are specified in the briefs. “Preserve” means a foundation exists, not that every original acceptance criterion has passed.

| Original IDs | Primary packages |
|---|---|
| F01 | 02, 03, 04; 00 reconciles E01–E30 across views |
| F02, T01 | 00 preserves inventory/provenance and closes documentation gaps |
| F03, F04, T03 | 01; 00 handles shared integration and lazy view loading |
| F05 | 06 |
| F06, D07 | 05 |
| F07 | 07 presentation; 10 corrections process; 00 obtains verified attribution |
| F08 | 01 data separation; 02–04 content; 08 glossary/synthesis |
| R01–R07, R09, R10, R12 | 07; 08 supplies canonical terms; 10 validates |
| R08, R11 | 02–04 author, 01 records, 07 renders; 08 connects paths |
| R13 | 11-E |
| D01–D06 | 08 |
| D08 | 11-A |
| V01 | 09 |
| V02 | 07 finishes existing explainer; 03 checks monetary mechanics |
| V03–V09 | 11-A through 11-F |
| T02, T04–T06 | 10; implementation owners fix their own UI |

## Release decision

P0 priority claims must be corrected, qualified, or explicitly withheld everywhere repeated. Every published event destination needs editorial relevance review; a reviewed source-timeline fallback is acceptable when no chapter supports the event, but an unreviewed fallback is not a completed audit. Chart candidates may remain withheld with explicit recorded dispositions; restoring all eleven is not a prerequisite for the smaller release allowed by the original plan.

P1 completion requires the reading/discovery/comparison features and the original plan's navigation, responsive, accessibility, metadata and measurement checks. Run five real moderated reader sessions for comprehension/discovery targets; agents must not fabricate human results. Attribution needs verified owner/editor details. Indexing and field performance require external evidence and must be reported separately from local checks. If these inputs are unavailable, record the precise unresolved gate and continue independent work; do not mark the full release complete.

Start an agent with: **“Read `plans/README.md` and `plans/<assigned-brief>.md`. Complete all edits in that package within its ownership boundaries. Do not write or run tests, validation builds or browser checks; testing happens in package 10 after all edits are integrated. Preserve existing work, report dependent changes in `workstreams/<id>/HANDOFF.md`, and do not claim unperformed verification.”**
