# Measurement definitions

Updated 19 October 2026 for https://goldtozcash.com. Do not invent traffic or ranking baselines.

## Four-day review

This Amp thread has an enabled, ongoing four-day schedule, first due 23 October 2026 at 17:34 Asia/Calcutta. Reports stay in the deployment thread. Reviews are read-only: they do not authorize deployments, DNS changes, content edits or indexing requests.

Google Search Console access is connected through the orb Desktop Chrome. Settings confirms “You are a verified owner” for `sc-domain:goldtozcash.com`, added 19 October 2026. A Google session may expire; reconnect when requested rather than sharing credentials in the thread. No separate Google API/OAuth integration is configured. Bing ownership remains unverified.

### Initial Google baseline — 19 October 2026

- Submitted https://goldtozcash.com/sitemap.xml. Google reports Success, last read 19 October 2026, 55 discovered pages and 0 discovered videos. Discovered pages are not indexed pages.
- Page indexing and performance reports are still processing; no reliable indexed total, exclusion breakdown or search-traffic baseline is available yet.
- Homepage URL Inspection: “URL is not on Google” / “Discovered - currently not indexed”; sitemap recognized, no last crawl and no selected canonical recorded.
- Homepage live test at 12:12 UTC: “URL is available to Google” / “Page can be indexed”; smartphone Inspection Tool fetch successful, crawling and indexing allowed, declared canonical https://goldtozcash.com/. Google-selected canonical is determined only after indexing.
- A homepage indexing request failed with Google's “We had a problem submitting your indexing request. Please try again later.” A second attempt after the successful live test also failed. No successful manual indexing request is claimed; do not repeatedly resubmit or equate this submission failure with a fetch failure.
- Manual actions and Security issues each report “No issues detected”. This is not an editorial or ranking endorsement.

Evidence is in `.amp/in/artifacts/browser-use/search-console/` in the deployment thread; live technical results are `.amp/in/artifacts/seo-live-checks.json`. The setup recording/contact sheet failed at finalization; screenshots and saved report text remain available.

Each report should record:

- Google's reporting/data-through dates; compare complete periods rather than today's incomplete totals.
- Page indexing totals and each changed exclusion reason, with affected URLs. Separate expected search/raw-content exclusions and legacy redirects from unintended exclusions.
- Sitemap fetch/submission status, last read and discovered URLs for https://goldtozcash.com/sitemap.xml.
- URL Inspection results for changed/error URLs and a rotating sample of the homepage, four hubs and chapters: indexed verdict, last crawl, fetch/indexing restrictions, declared canonical and Google-selected canonical. This is Google's indexed version, not a live test.
- Web search clicks, impressions, CTR, position, landing pages and queries for comparable periods; flag low-volume or delayed data.
- Manual actions, security issues and crawl problems when accessible.
- Cloudflare visitors, views, referrers, popular pages and Core Web Vitals for comparable periods. State unavailable data, sampling and low traffic explicitly.
- Prioritized recommendations and changes since the previous report. If access has expired, report the exact reconnect step rather than inferring indexing from HTTP responses.

## Indexed coverage versus technical eligibility

Actual indexed coverage comes from Google Search Console. Separately measure whether the 55 sitemap URLs return 200, are indexable, have matching self-canonicals and contain crawlable HTML. A successful technical check, sitemap inclusion or a submitted indexing request does not prove indexing or ranking.

## Cloudflare Web Analytics

Enabled 19 October 2026 with automatic zone-wide injection on the proxied custom domain. Account: `1378ab230486e0367cbcb49a0f4cec1d`; site tag: `62b9b4dfbcce4babaac4bf1c32b83d6d`; zone: `a35f7bdfa4a2e9787b31f03d4c54eabe`. View it under Cloudflare → Web Analytics → goldtozcash.com.

Cloudflare injects one beacon at the edge; do not also embed it in React or `index.html`. Injection requires an HTML-accepting request, so bare curl's `Accept: */*` is not a valid beacon check. SPA navigation tracking is built in. Live browser page-load and Gold-hub navigation beacons reached `/cdn-cgi/rum` with HTTP 204. Collection begins with enablement; historical traffic cannot be recovered by this setup. Browser blockers and network failures mean counts are incomplete. Measurements from deployment checks are synthetic visits, not an organic-traffic baseline.

Read-only GraphQL data access was verified through Cloudflare MCP (`POST /graphql`, under `viewer.accounts` filtered by this account). `rumPageloadEventsAdaptiveGroups` accepts `siteTag`, `datetime_geq`, `datetime_lt`; `count` measures views and `sum { visits }` measures visits. Grouping dimensions verified in the schema include `requestHost`, `requestPath`, `refererHost` and `navigationType`. Omit dimensions for totals; use separate grouped queries for pages/referrers. The first query returned homepage and Gold-hub test traffic. Do not label visits as unique people or infer entry pages from all page views. Web Vitals use a separate dataset; inspect its schema before querying. Avoid repeated schema introspection: it exhausted the GraphQL rate-limit budget during setup (five-minute retry delay).

The public disclosure is `/methods/#analytics`. No custom passage, search-text, click or conversion events have been added. Web Analytics is not Google Analytics and does not verify Search Console ownership.

## Non-brand queries

Queries that do not contain “Money Research”. Record query, country/language, date, intent and owning URL when Search Console is connected.

## Organic landing engagement

Page views and referrers can describe entry traffic, but Web Analytics alone does not establish chapter-completion or source-click conversions. Those events are not instrumented. Do not report them as measured or collect search box text or selected passages to approximate them.

## Identifiable AI referral traffic

Referrers that name an AI product. A mention without a link is not a citation. Missing referral data is not proof of no AI visibility. Google AI-feature traffic stays inside Search Console Web reporting.

## Representative questions

Future citation observations must record platform, date, question and cited URL.

1. Why did gold lose its official monetary role after 1971?
2. What can 2026 gold prices and reserve shares actually establish?
3. What changed when the dollar’s gold window closed?
4. How did the 2008 credit crash differ from later central-bank asset purchases?
5. Which trust problems does self-custodied Bitcoin solve, and which remain?
6. Does a fixed Bitcoin base fix the whole money supply?
7. How should gold and Bitcoin be compared as reserve assets?
8. How is a bank loan different from QE in a £100 example?
9. What does Money Research treat as accepted evidence versus withheld material?
