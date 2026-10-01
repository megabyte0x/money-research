# docs(seo): record Search Console baseline and sitemap submission

Observed 2 October 2026, India time. Production: https://goldtozcash.vercel.app/. The initial Search Console tab showed finalnotes.page; all measurements below come from the matching Money Research URL-prefix property.

## Verified action

Search Console had no submitted sitemap. Submitted the existing `/sitemap.xml`. The initial table briefly reported “Couldn't fetch”; the detail view subsequently confirmed “Sitemap processed successfully,” last read 2 October, with 55 discovered pages. No code or production deployment was needed. See `sitemap-success-2026-10-02.jpg`.

## Search baseline

| Measure | Observed value |
| --- | --- |
| Performance filter | 28 days, Web (text), all countries/devices |
| Total impressions | 412 |
| Total clicks | 0 |
| CTR | 0% |
| Average position | 10.8 |
| Query rows disclosed | 18 |
| Chart dates with data | 18–28 September 2026 |
| Report freshness label | 10 hours ago |
| Indexed pages | 41 |
| Not indexed | 4 |
| Indexing report last update | 21 September 2026 |

The sitewide average is not evidence of a top result for a useful target query. “why gold standard ended” had four impressions and average position 76. “who stopped the gold standard” had one impression at 52; “what happened in 1971 gold” had one at 59. Two disclosed search-operator queries had positions 3 and 6. Query rows omit some data and do not sum to the aggregate. Do not infer traffic potential or rankings for undisclosed queries. Full visible query evidence is saved in `gsc-performance-2026-10-02.txt`.

The gold-standard-ending question cluster is a provisional focus supported by these observations. Country-specific distinctions (UK departure, US domestic convertibility, Bretton Woods external dollar conversion) need clear answers and primary evidence, rather than treating “the end” as one universal event. Owner priorities and target geography remain unconfirmed.

## Indexing exclusions

| URL | Recorded reason | Observed follow-up |
| --- | --- | --- |
| `/arc/` | Excluded by noindex | Validation already started 1 October; current live response passes indexability checks |
| `/compare/` | Excluded by noindex | Same validation; current live response passes indexability checks |
| `/takeaways/` | Excluded by noindex | Same validation; current live response passes indexability checks |
| `/after/05-globalization-and-emerging-market-crises-1990-2001/` | Crawled, currently not indexed | Google index record: fetch successful, crawling/indexing allowed, canonical matches inspected URL; live test 2 October says URL available to Google and page can be indexed |

No validation was restarted and no indexing request was repeated. The older report does not prove the present exclusion status has changed. The live test is eligibility evidence, not proof of indexing or ranking.

## Live technical audit

Fetched all 55 sitemap URLs and saved `live-crawl-2026-10-02.json`. Every URL returned HTTP 200 with a matching single self-canonical, `index, follow`, one H1, parseable JSON-LD and no X-Robots-Tag header. This validates those signals only; it does not certify schema eligibility, content accuracy, source availability or page experience.

The sitemap is valid XML and robots.txt returns HTTP 200, allows `/` and declares the correct sitemap. A separate request with a Googlebot user-agent string also received HTTP 200 for the sitemap; this is not a request from Google's verified crawler IP. Real Google live testing confirmed fetchability of the excluded chapter.

The static build passed. Existing tests passed 93 of 94 inside the sandbox; the HTTP test could not bind localhost. Running that test separately with the necessary permission passed. All 94 checks therefore passed across the two runs. No source-code change was made. Installed lockfile dependencies with `npm ci --ignore-scripts` to restore missing build packages.

## GEO and reader trust

Applied the technical and GEO checklists from [claude-seo](https://github.com/AgriciDaniel/claude-seo), checked against [Google AI feature guidance](https://developers.google.com/search/docs/appearance/ai-features) and [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Published HTML, useful answers, accessible evidence and truthful attribution are the focus. No special AI schema or llms.txt ranking benefit is assumed, and no AI citation was observed or claimed.

Current chapter schema contains accepted claim citations while opening summary sections omit visible citation locators. Proposed bounded improvement: expose the existing accepted evidence beside the opening answer in both React and static HTML. Clearly describe citations as supporting specific chapter claims, without implying that they independently verify every summary statement. Do not add citations where none were accepted. Implementation approval is pending under the brainstorming skill.

Named authors, credentials, correction contacts and ownership details must come from the owner. Do not invent them. The existing methods page acknowledges missing public names/contact details. Editorial and release gates in IMPLEMENTATION-STATUS.md remain open.

## Next measurements and approvals

1. Follow the newly submitted sitemap and existing validation after Google refreshes its reports. Avoid repeated submissions for unchanged pages.
2. Obtain approval for the visible-evidence improvement, implement it using existing accepted records and verify React/static parity.
3. Establish owner-approved target questions/geography and use per-query positions plus relevant clicks for progress. Aggregate position is insufficient.
4. Improve existing gold-standard explanations only after checking exact primary sources and editorial scope. Do not generate keyword-variant pages.
5. Measure field Core Web Vitals when enough data exists; the overview currently has no experience data.
6. Recurring follow-ups were attempted but automatic approval review rejected scheduling as insufficiently explicit authorization. A daily 10:00 AM India-time follow-up request is pending. No automation was created for this site.

Top search visibility and AI citations have not been achieved or verified. The app goal is active again, as verified on the next continuation.


## Update after owner approval on 2 October

The owner approved visible chapter citations, the source-backed Gold 07 draft and daily 10 AM India-time follow-ups. The approved implementation now passes the static build and all 94 tests in one full permitted run. Desktop and 390px mobile browser checks found no page overflow. The daily heartbeat `money-research-seo-and-geo` is ACTIVE and will notify only on meaningful changes, failures or required action.

These local changes are not on the production site. Automatic approval review rejected Vercel deployment because implementation approval did not explicitly authorize a production deployment. See `implementation-2026-10-02.md` for the reviewable result. Original observations above remain the pre-change baseline.

A subsequent local structured-data audit found duplicate page graphs after reader startup. The shared static/client script ownership fix now passes `npm run test:release` with all 95 tests and browser chapter-navigation verification. This remains pending production deployment.

## Production deployment update

The owner explicitly approved deploying the tested update despite the broader open release gates. Deployment `dpl_6sRAxeDUFTqDsWzdjeBxRBRFGngd` is READY and assigned to goldtozcash.vercel.app. An unauthenticated audit of all 55 sitemap URLs returned HTTP 200, matching self-canonicals, index/follow, one H1 and one parseable JSON-LD graph per page; every response exactly matches the approved built HTML. Sitemap and robots.txt return HTTP 200. See `live-deployment-2026-10-02.json` and `deployment-2026-10-02.md`. Deployment authorization is resolved. No ranking improvement can yet be inferred.

Google’s Gold 07 live test completed at 1:23 AM India time on 2 October: available to Google, page can be indexed, one valid breadcrumb item. A single indexing request for this materially changed chapter was accepted into the priority crawl queue. Do not repeat it for unchanged content. This does not prove a fresh index entry or ranking improvement.
