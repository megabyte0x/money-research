# Initial evidence contract

The coordinator owns `public/content/sources.json`, `claims.json`, `observations.json`, and the active build seam. Editors hand off evidence packets using the fields in `plans/README.md`; they do not modify shared records.

Sources have stable lowercase IDs, publisher, title, HTTPS URL, source type, nullable publication date, and real access date. Null is an explicit unknown date; the validator checks true calendar dates where provided. Claims have stable IDs (existing E-IDs remain stable), assertion type (`fact`, `estimate`, `interpretation`, `scenario`), scope, review state (`accepted`, `withheld`, `review`), supporting and contrary source locators, dependent article IDs and views, and a reviewer/revision note. Accepted claims require an exact supporting locator and a known source ID. Unresolved or merely proposed claims do not enter public factual outputs.

Observations retain their stable IDs and original source URL/date fields during migration. Each accepted observation also has `sourceId`; its `claimId` must resolve to an accepted claim whose supporting locator uses that source. Calendar dates, period, units, denominator, method, verification and revision are validated. Observation periods are separate from source publication and access dates. `{{obs:id}}` remains the publication token; any unknown token fails the build.

Article summary, takeaways, evidence/uncertainty, topics and related-reading proposals live in editor packets until reviewed. The coordinator will add them to generated metadata only after evidence reconciliation, keeping claims and observations as the source of dated values. Package 08 owns glossary/path proposals; package 09 owns comparison proposals. This contract can be expanded by a documented coordinator revision without changing stable IDs.

User preference received during integration: methods/about content should carry URL links on the source page only; do not display author/editor names, roles or a corrections contact. The original plan's verified-attribution/contact criterion therefore remains intentionally unmet and must be identified in the gate report rather than invented.
