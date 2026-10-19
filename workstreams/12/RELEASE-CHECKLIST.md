# Release checklist (SEO/GEO candidate)

This checklist does not close `IMPLEMENTATION-STATUS.md` editorial blockers.

Cloudflare SEO deployment checked 19 October 2026:

- [x] `npm run build:cloudflare` and `npm test` exit 0; 103 tests passed. `cf deploy --prebuilt --dry-run` validated before production deployment.
- [x] Live checks: 55 canonical URLs with unique titles/descriptions, correct canonicals, one H1, valid JSON-LD and one correct analytics beacon; 96 permanent alias redirects; 55 sitemap-page social images; robots, search/raw-content noindex, genuine 404 and HTTPS controls.
- [x] `www` permanently redirects to the HTTPS apex, preserving path and query. Public `workers.dev` and deployment preview URLs disabled; do not assume separate Vercel previews are protected by Cloudflare.
- [x] Production origin is `https://goldtozcash.com`.
- [x] Cloudflare Web Analytics enabled; browser beacons accepted with HTTP 204, including navigation to the Gold hub. GraphQL read access confirmed. Public analytics disclosure rendered and inspected at desktop/narrow widths.
- [x] Search Console domain ownership verified; sitemap submitted, status Success, 55 discovered pages.
- [x] Google homepage live test: fetch successful, crawling/indexing allowed, correct canonical.
- [x] Four-day monitoring enabled in the deployment thread; first run 23 October 2026 at 17:34 IST.
- [ ] Aggregate Google indexing/performance baseline: processing. Homepage currently discovered but not indexed; manual indexing request returned a Google-side error.
- [ ] Redirect the former Vercel production hostname to the matching new URLs; Vercel access still needed. Submit Change of Address if applicable after validating migration redirects and ownership of both properties.
- [ ] Submit sitemap in Bing when account access is available.
- [ ] Resolve `IMPLEMENTATION-STATUS.md` remaining editorial, chart, timeline, comparison, accessibility and performance blockers through their own release review; deployment does not certify them.

Keep previous Cloudflare deployment versions for rollback. The source configuration is versioned in this repository; production is deployed directly with the authorized CLI, not through a Git-triggered pipeline. Evidence: `.amp/in/artifacts/seo-live-checks.json` and `.amp/in/artifacts/browser-use/search-console/` in the deployment thread.
