# SEO / GEO publication decisions

Updated 19 October 2026. These decisions are applied by `src/site-config.js`, `src/routes.js` and the Cloudflare production configuration.

## Domain and URL convention

- Production origin: `https://goldtozcash.com`, served by Cloudflare Workers Static Assets.
- `www.goldtozcash.com` permanently redirects to the HTTPS apex, preserving path and query, through a zone Single Redirect and proxied CNAME. Rule phase: `http_request_dynamic_redirect`; ruleset: `0b55316ff0054715b612affcf25ad44d`. These are account-side settings, not deployed by the static build.
- The public `workers.dev` endpoint is disabled in `cloudflare.config.ts` to avoid a second production copy. Do not re-enable it as an unprotected preview.
- Migration blocker: `https://goldtozcash.vercel.app` still returns 200. Vercel access is unavailable in this orb. Configure path-preserving permanent redirects on that old host, then use Search Console's Change of Address tool if applicable after both properties are verified. New-host canonicals do not replace old-host redirects. Retain migration redirects for at least a year.
- Trailing slash on all canonical page paths.
- English-language educational publisher; readers researching monetary history and comparing systems.

Search Console domain ownership is verified. The sitemap was submitted successfully with 55 discovered pages on 19 October 2026. The homepage is discovered but not yet indexed; Google's live smartphone fetch succeeds and allows indexing. Aggregate indexing/performance reports are still processing, and manual indexing submission returned a Google-side error. Bing Webmaster and a bounded SERP review were not available. No search-volume or ranking baseline is invented. See `MEASUREMENT.md` for the initial baseline, active four-day review and Cloudflare Web Analytics setup.

## Indexability

| Route | Index | Disposition |
|---|---|---|
| `/` | yes | Static introduction and volume/chapter links |
| `/gold/`, `/after/`, `/bitcoin/`, `/zcash/` | yes | Four volume hubs; former `00-readme` introductions moved here |
| `/gold/00-readme/` and aliases | no | Permanent redirect to the hub |
| Existing `/<volume>/<slug>/` chapters | yes | 42 direct chapter pages; 32 topic chapters keep approved questions |
| `/methods/`, `/glossary/`, `/sources/` | yes | Shared process, definitions and bibliographies |
| `/timeline/`, `/takeaways/`, `/mechanics/`, `/compare/`, `/arc/` | yes | Current registry publishes these routes; this does not close their editorial gates |
| `/search/` and query variants | no | Interactive utility; omitted from the sitemap |
| `/content/*` | no | Supporting Markdown/JSON with `X-Robots-Tag: noindex`; remain fetchable |
| Unknown paths | no | HTTP 404 |

The sitemap contains 55 canonical URLs. Numeric aliases and former shared/introductory pages redirect to their canonical destinations; both slash forms are covered by the generated Cloudflare `_redirects` file. They are not duplicate HTML copies. Every canonical HTML page is prerendered, with metadata, ordinary links and substantive content available without JavaScript.

## Metadata fields

Title, description, canonical path, indexability, robots directive, social type, unique social image (1200×630), page type, and recorded publication/modification dates when they exist. Descriptions use scoped chapter SEO copy without truncating a qualification. Article author/publisher is the site organization, Money Research; no named human author, editorial board, peer-review, NewsArticle, ratings, financial-product or fact-check claims are invented.

Schema types include WebSite, WebPage, Article, CollectionPage, AboutPage, BreadcrumbList and DefinedTermSet as appropriate. FAQPage and SearchAction describe visible content and working site search; they are not promises of Google rich-result eligibility. Do not fabricate publication dates, authorship or expertise to fill optional schema fields. `llms.txt` is supplementary, not a Google indexing requirement or ranking guarantee.

## Reader questions

Each topic chapter maps to its approved question in `public/content/article-metadata.json`. Volume hubs use the volume’s directory question. Home: how money works and where to start. Methods: how the research is produced and limited.
