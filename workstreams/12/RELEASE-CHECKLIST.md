# Release checklist (SEO/GEO candidate)

This checklist does not close `IMPLEMENTATION-STATUS.md` editorial blockers.

- [ ] `npm run test:release` exit 0 on this candidate
- [ ] Host checks: canonical 200, alias redirects without chains, unknown paths 404, robots/sitemap/images/raw content headers
- [ ] Preview protection still enabled
- [ ] Production origin still `https://money-research-iota.vercel.app` unless a new domain is recorded
- [ ] `IMPLEMENTATION-STATUS.md` remaining editorial, chart, timeline, comparison, accessibility and performance blockers still open
- [ ] Promote only through the existing release decision; keep the previous production deployment for rollback
- [ ] After publication, submit the sitemap in Search Console and Bing when those accounts exist
