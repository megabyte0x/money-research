# Corrections and minimal measurement proposal

The public methods/about view should show only links to the three volume source pages (`/gold/12-sources/`, `/after/13-sources/`, `/bitcoin/16-sources/`). Do not add author/editor names, roles or a corrections contact; no verified public details were supplied. The internal correction process below can be operated once a responsible team is assigned. It does not imply a public intake channel already exists.

## Internal correction record

Create a durable case with: case ID, received date, affected URL/article/section, reported wording or figure, claimed error, source URL and exact locator if supplied, reporter contact only if voluntarily supplied, triage owner, severity, current claim/source/observation IDs, affected views, decision, supporting/contrary evidence, revision date, changed URLs, reviewer and resolution. Keep the original assertion and the replacement so propagated changes can be audited. Avoid storing selected passages or reader search text in analytics.

Triage: **P0** for materially wrong numerical, legal, technical or monetary claims repeated in prominent views; **P1** for a misleading qualification, broken source destination, section route or accessibility failure; **P2** for small copy or presentation errors. A P0 case stays open until the corrected, qualified or withheld assertion is checked in chapters, summaries, home, timeline, glossary, comparison and chart references. Record source-vintage changes without overwriting prior dated assertions.

Assign a named owner before operation for each volatile dataset and legal-status field. Proposed review triggers: market/price snapshots at each new cited edition or known erratum, reserve/demand statistics at new source releases, legislation when proposal/passage/signature/effective/local-enforcement status changes, evergreen explanations annually and after material new evidence. A specific calendar interval and owner cannot be certified yet; record both in the source/observation ledger before publishing maintained data.

## Privacy-conscious measurement contract

Proposed aggregate events: `path_start`, `path_complete`, `search_results`, `citation_open`, `comparison_use`, `correction_open`. Each event contains a schema version, UTC day, route kind, path ID or comparison mode where applicable, and a bounded count bucket for search results (`zero`, `one`, `two_to_five`, `six_plus`). It must not contain raw search text, selected passages, article body, full URLs with query strings, account identifiers or persistent browser identifiers. `search_results` can record the chosen volume filter and success/no-results bucket. Use one event per explicit user action or settled search, with debounce to avoid counts per keystroke.

The deployment mechanism, collection endpoint, access owner, retention period and deletion process remain dependencies; no analytics service has been configured or data collected. Before wiring a collector, choose these fields and disclose the collection in the public method/privacy copy. Five moderated sessions remain a separate human study and cannot be replaced by synthetic events.
