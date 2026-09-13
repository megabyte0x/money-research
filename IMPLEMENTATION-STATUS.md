# Implementation status · 13 September 2026

This branch is a staged preview of the companion `website-improvement-plan.md` held in the local `eco-research` workspace, not the completed 4–6 week editorial release.

## Baseline

- Deployed project: Vercel `money-research`, linked to `megabyte0x/money-research`; Vite/React 18, static content in `public/content`, legacy hash routes.
- The manifest lists 44 records: Gold 13, After Gold 14, Bitcoin 17. Each now has an explicit stable volume-number ID, original source path, and any numeric legacy alias. The supplied Bitcoin files are numeric (`00.md`–`16.md`), while website slugs are descriptive. The 42 otherwise unchanged published documents match the originals byte-for-byte; Bitcoin 02 and 13 contain the branch's editorial qualifications.
- Original research and existing article links remain available. The source `project/content` and public copies should be consolidated after editorial review.

## In this preview

- R01/R06/R07 (partial): short introduction and responsive menu/contents control; the full historical arc remains under History.
- V01 (provisional): qualitative arrangement-specific comparison without scores or volatile figures. This is **not** the cited final table.
- F05 (interim): the historical arc's numerical charts are withheld pending dataset and citation audit; its prose is still under review.
- F06 (interim): automatic keyword matching is removed. Two reviewed event-to-section relationships are explicit; unreviewed rows lead only to the source timeline, not an unrelated chapter. Composite events and chronology still need editorial normalization.
- F02: all 44 documents have explicit stable IDs and original-file provenance; numeric Bitcoin routes resolve to their descriptive website records.
- D07 (partial): the three volume timelines now display together in chronological order, with textual volume lanes and five explicitly identified shared events deduplicated. Composite rows, date precision and the remaining overlap audit are still open.
- T02 (substantial): all 44 articles now get a direct static HTML route with crawlable text, unique title/description, canonical and Open Graph URL, plus sitemap entries. Numeric Bitcoin aliases get canonicalized pages; old hash routes still resolve. Search and other standalone views remain hash-routed, and social-image previews/indexing still need validation.
- T02/T05 (partial): prerendered articles now include same-volume chapter links for “file NN” references and linked section contents without requiring JavaScript. The build-output test checks that generated internal article and section targets exist. This does not establish topical relevance, external-source availability, legacy-link behavior in a browser, or indexing.
- D03/D04 (partial): explanatory and glossary search hits rank above directories; section names are shown; queries can be copied as `#/search?q=…`; browser Back restores a direct article after entering search. Volume filters, aliases and grouping still need work.
- F07 (partial): methods page with scope, source lists, revision note, and correction issue link. Author attribution remains unverified.
- F01/F03 (partial): a claim-level source ledger now records primary-source locators for E03 (Basel timing/treatment), E05 (Great Inflation chronology) and E06 (FX settlement mechanism). These corrections were applied to affected chapters, an After Gold directory summary, and a Bitcoin timeline entry. Most P0 claims still lack this treatment.
- F01/F03 (partial): E01 now uses the exact 2025 Federal Reserve SHED table and questionnaire. The Bitcoin directory, payment chapter and adoption chapter no longer translate U.S.-adult cryptocurrency percentages into a global Bitcoin-user payment share. The source list points to the actual table; the global share remains unknown here.
- F01/F03 (partial): E04 now separates the IMF COFER foreign-exchange denominator from the ECB's broader official-reserves measure in the Gold, After Gold and Bitcoin chapters. The old “allocated FX” label was removed for the revised series, and valuation effects are stated alongside the end-2025 gold share. Homepage reserve visualisation and other reserve claims still require audit.
- F01/F03 (partial): E08 now distinguishes El Salvador's 2025 amendment from repeal: the domestic statute retains “curso legal” wording but makes private acceptance voluntary and removes Bitcoin tax-payment authority. The legal distinction has been propagated through relevant Bitcoin and After Gold chapters, timelines, glossary and source list. Separate IMF programme commitments and adoption figures still require verification.
- T01/T05 (partial): inventory and relevance regression tests, plus a reproducible Vite build.

## Release blockers before production promotion

Editorial review of P0 claims and the source registry (F01–F04), chart datasets (F05), every timeline relationship and composite event (F06/D07), fuller comparison evidence (V01), social/indexing validation (T02), and accessibility/performance checks (T04/T05). The site should not imply these are complete merely because this preview builds.
