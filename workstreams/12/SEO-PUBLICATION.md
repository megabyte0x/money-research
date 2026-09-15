# SEO / GEO publication decisions

Recorded 15 September 2026. These decisions are applied by `src/site-config.js` and `src/routes.js`.

## Domain and URL convention

- Production origin: `https://goldtozcash.vercel.app`. The previous domain has been removed; this publication does not rely on old-host redirects.
- Trailing slash on all canonical page paths.
- English-language educational publisher; readers researching monetary history and comparing systems.

Search Console, Bing Webmaster, and a bounded SERP review were not available in this environment. No search-volume or ranking baseline is invented.

## Indexability

| Route | Index | Disposition |
|---|---|---|
| `/` | yes | Static introduction and volume/chapter links |
| `/gold/`, `/after/`, `/bitcoin/` | yes | Volume hubs; former `00-readme` introductions moved here |
| `/gold/00-readme/` and aliases | no | Permanent redirect to the hub |
| Existing `/<volume>/<slug>/` chapters | yes | Not blanket-removed; 32 topic chapters keep approved questions |
| `/methods/`, `/glossary/` | yes | Publication-ready process and definitions |
| `/timeline/`, `/takeaways/`, `/mechanics/`, `/compare/`, `/arc/` | no | Prebuilt; indexing waits on editorial disposition |
| `/search/` and query variants | no | Interactive utility; omitted from the sitemap |
| Unknown paths | no | HTTP 404 |

Numeric Bitcoin aliases redirect to the canonical chapter. They are not duplicate HTML copies.

## Metadata fields

title, description, canonical path, indexability, robots directive, social type, social image (1200×630), page type, and verified publication/modification dates when they exist. Descriptions use approved chapter answers without truncating a qualification. Author, publisher organization, editorial board, peer-review, NewsArticle, ratings, financial-product and fact-check fields are omitted.

## Reader questions

Each topic chapter maps to its approved question in `public/content/article-metadata.json`. Volume hubs use the volume’s directory question. Home: how money works and where to start. Methods: how the research is produced and limited.
