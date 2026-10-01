# fix(seo): publish verified chapter evidence and gold-standard answer

Owner explicitly approved deploying the bounded update to goldtozcash.vercel.app on 2 October 2026, with broader documented release gates still open. Those gates are not claimed complete.

- Production: https://goldtozcash.vercel.app
- Deployment: `dpl_6sRAxeDUFTqDsWzdjeBxRBRFGngd`
- Deployment URL: https://money-research-odeqkbkum-megabytes-projects.vercel.app
- Inspect: https://vercel.com/megabytes-projects/money-research/6sRAxeDUFTqDsWzdjeBxRBRFGngd
- Target/status: production, READY; confirmed through the Vercel deployment API and public responses.
- Project: `prj_B2maZyjQe2SwXOoTi5IKFyKXA5Px`, money-research, Vite 5.4.21.
- Source: official Vercel CLI 62.1.0, prebuilt output from the uncommitted approved workspace. The deployment's Git metadata reports base SHA `9329dcb`; it does not identify a commit containing these edits.

## Validation

The connector's deploy tool was unavailable, so the official CLI linked the verified existing project, pulled production settings, built successfully and deployed only `.vercel/output`. Local credentials and audit artifacts were not part of the uploaded static output. CLI-created `.env*` files are ignored by Git.

All 95 tests passed after the production build. The Vite mixed static/dynamic content-loader import warning remains. Vercel's build-output packaging completed in about five seconds; the local content/card/build stage was separate.

An unauthenticated fetch of every sitemap URL found all 55 return HTTP 200 and exactly match the approved built HTML. Each has the expected self-canonical, index/follow, one H1 and one parseable JSON-LD graph, with no noindex HTTP header. Sitemap and robots.txt return HTTP 200; robots.txt names the sitemap. The changed Gold 07 and bibliography sitemap dates are 2 October. Evidence: `live-deployment-2026-10-02.json`.

The browser confirms the public Gold 07 chapter shows the new answer, visible citations and comparison, and the interactive reader starts with one structured-data graph and the correct canonical/description. Screenshot: `gold07-live-2026-10-02.jpg`. Browser warning/error log check returned no entries. Vercel's scoped error/fatal log query for the new deployment returned no entries in its ten-minute window; this brief static-site observation is not ongoing error-rate certification.

## Search measurement

Google Search Console reports Gold 07 “URL is on Google” and “Page is indexed,” with two valid breadcrumb items. This existing index record does not prove Google has recrawled the newly deployed answer. The live URL test completed successfully on 2 October at 1:23 AM India time: “URL is available to Google,” “Page can be indexed” and one valid breadcrumb item. Evidence: `gsc-gold07-live-test-2026-10-02.txt` and `.jpg`. The older index record had two breadcrumb items; the single live item is consistent with the duplicate-script fix.

A single indexing request was then accepted: “URL was added to a priority crawl queue.” Evidence: `gsc-gold07-indexing-request-2026-10-02.txt` and `.jpg`. Do not request this unchanged chapter again; acceptance is not proof of recrawling or improved ranking. No CAPTCHA challenge was presented for agent completion.

The pre-change target query had four impressions, zero clicks and average position 76. No ranking improvement or AI citation is verified. The daily 10 AM India-time heartbeat remains ACTIVE. It should compare later reports with the saved baseline, avoid repeated submissions and notify only on meaningful changes or required action.
