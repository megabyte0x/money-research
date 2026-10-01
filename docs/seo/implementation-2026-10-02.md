# fix(seo): expose chapter evidence and clarify gold-standard departures

Owner approved the citation proposal, Gold 07 draft and daily follow-ups on 2 October 2026. The owner subsequently approved production deployment with the broader documented release gates still open. The citation, answer and structured-data changes are now deployed and verified on the public domain; see `deployment-2026-10-02.md`.

## Reader and search changes

Chapter summaries show accepted source titles and precise locators in both prerendered HTML and the interactive reader. The label “Sources for specific chapter claims” limits the scope of this evidence. Chapters without accepted citations do not gain invented references.

Gold 07 answers “Why did the gold standard end?” and separates Britain's 1931 departure, US domestic conversion restrictions in 1933 and the official dollar–gold window in 1971. A linked comparison and related chapters appear in the opening, ahead of static contents. Existing headings, aliases and canonical URL are preserved. A scoped search description is available to chapter metadata and validated at 160 characters maximum; search engines may choose another snippet.

Two institutional sources and three narrow claims were added to the registries. Review provenance records direct source checking and the owner's approval without inventing an independent reviewer. The Gold bibliography and derived chapter word counts were updated; substantive modified dates are 2 October. The existing narrative was retained.

The subsequent browser audit found two copies of page JSON-LD after the reader loaded. Static HTML emitted an unmarked script, while the client updater selected only `data-seo="page"` and appended another. Static output now uses the same ownership marker, so the client reuses the graph. The replacement path accepts the marked script on later document updates.

## Verification

- Earlier citation/answer verification passed all 94 tests after granting localhost permission.
- After the structured-data fix, `npm run test:release` with that permission passed the complete build and all 95 tests in one run. The existing Vite warning about mixed dynamic/static content-loader imports remains.
- `git diff --check`: passed.
- Browser review of the built interactive chapter: updated answer, accepted citations and comparison present. At 1280px desktop and 390px mobile, document width equals viewport width. The mobile table uses its scroll wrapper.
- Browser metadata checks after rebuilding found exactly one JSON-LD graph on Gold 08 and after interactive chapter selection to Gold 07; its Article URL matched the current canonical. Evidence: `structured-data-local-2026-10-02.json`. The regression test failed before the static script ownership fix and passed afterward.
- Existing SEO tests verify the generated static chapter exposes accepted citation URLs and locators. Metadata tests reject descriptions over the allowed limit.

Screenshots: [desktop](gold07-local-desktop-2026-10-02.jpg), [mobile](gold07-local-mobile-2026-10-02.jpg). Local preview: http://127.0.0.1:4173/gold/07-the-gold-standard-era-1717-1971/ while the preview process remains running.

## Follow-ups and release status

Daily heartbeat `money-research-seo-and-geo` was created and verified ACTIVE for 10 AM India time. It compares Search Console against the recorded baseline, avoids redundant submissions and stays quiet when nothing actionable changes. This is a scheduled task, not evidence that rankings improved.

The first deployment attempt was rejected for missing explicit production authorization. After the owner explicitly approved deployment, the connector returned a missing-tool error. The official Vercel CLI deployed the prebuilt output successfully. No commit, push or PR was performed. Wider editorial/security gates in the repository remain unresolved; approval of this bounded change does not certify the rest of the publication. A production release must respect those gates.

The existing live sitemap remains successfully processed with 55 discovered URLs. No repeated indexing request was made. Relevant target-query rankings, clicks and AI citations have not yet improved or been verified; the Search Console baseline remains the appropriate comparison.
