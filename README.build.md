# Money Research · reader implementation

A research reader over 44 Markdown files in three volumes: Gold, After Gold and Bitcoin. The original design handoff is in `project/` and `chats/`; the active site is `src/` plus `public/content/`.

## Stack

Vite + React 18, no router library. Article pages are prebuilt as crawlable HTML and also render in React; legacy hash URLs remain usable:

| Route | View |
| --- | --- |
| `/#/home` | Short introduction |
| `/#/compare` | Arrangement comparison with evidence-pending cells |
| `/#/arc` | Historical arc; numerical charts withheld during source audit |
| `/#/home/volumes` | Three volume directories |
| `/#/timeline` | Connected chronology; turning points or all events |
| `/#/takeaways?vol=<volume>&topic=<topic>` | Browse editor-approved chapter answers by volume/topic; cross-volume synthesis is withheld |
| `/#/glossary` | Aggregated glossary |
| `/#/methods` | Research scope and links to each volume's source page |
| `/<vol>/<slug>/` | Crawlable article with unique metadata and canonical URL |
| `/<vol>/<slug>/?section=<id>` | Direct section link |
| `/#/<vol>/<slug>[/<section>]` | Supported legacy hash article link |
| `/#/search?q=…` | Shareable passage search |

## Content

The published Markdown is in `public/content/`. `manifest.json` records each article's stable ID, original-file provenance, volume, slug, numeric alias where applicable, title, word count and headings. Bitcoin source files in the supplied workspace are numeric; the website uses descriptive slugs. `project/` and the sibling research volumes are archival provenance snapshots. `src/md.js` parses the content, while `scripts/prerender.mjs` creates article HTML and `sitemap.xml` from the same manifest at build time. See `IMPLEMENTATION-STATUS.md` for open editorial and release gates.

The evidence registry lives in `public/content/sources.json`, `claims.json` and `observations.json`. Current accepted observation tokens in chapters use `{{obs:<id>}}`; build validation checks their calendar dates, source IDs, exact locators and accepted claim relationships. A changed observation value resolves into `content/index.json`, generated Markdown and static article HTML together. Other major claims still need editor packets and review before they can be marked accepted.

Editor-approved questions, short answers, scoped takeaways, evidence/limits copy and section-specific next steps live in `public/content/article-metadata.json` for 32 chapters. The build checks article IDs and exact target section IDs, then puts the approved copy in both React and static article HTML. The Takeaways route browses these approved answers; the proposed five-minute cross-volume essay remains withheld pending exact editorial/evidence review. Unapproved topic metadata is omitted; the chapter review notice remains while dated claims are audited. Accepted claims with explicit chapter IDs also supply source URLs and exact locators in both article outputs; these claim scopes do not certify a whole chapter.

The connected Glossary uses seven explicitly accepted conceptual definitions in `src/features/discovery/canonical.js`, reviewed against their volume counterparts. The accepted ID list is deliberate, so a later proposal will not publish itself. Unique terms retain their source-volume wording. The canonical cards omit dated case notes, current legal implementation and named-issuer claims. The shared Markdown renderer allows safe HTTP(S) and local research-route links in both React and static HTML; bare publisher URLs become links only on the three volume source pages.

`public/content/comparison-cells.json` contains five scoped cases: a UK Monzo current-account transfer, a self-custodied Bitcoin main-chain transfer, an England/Wales Bank of England note offer plus a merchant acceptance-choice case, and Circle LLC's Type B redemption contract for a US holder of native Ethereum USDC. The last case describes issuer contract rights only; market cash-out value, purchasing power and independent reserve sufficiency remain unknown here. `src/comparison-cells.js` checks each cell against an accepted comparison claim and exact registered source URL/title/locator before it reaches the generated index. Other arrangement/use/perspective cells remain visibly pending; these cases do not rank speed, cost or safety.

Durable event IDs in `public/content/timeline-event-ids.json` join source-timeline rows to checked chapter references. `public/content/timeline-review-status.json` is generated from package 05's row reviews; the build validates its complete ID coverage and distinguishes checked chapter links, reviewed source-timeline fallbacks and pending destination reviews in the connected timeline. These link states do not certify each event's date or quantitative claim.

After an approved chapter edit, run `node scripts/refresh-manifest.mjs` to inspect changed word counts and headings, then `node scripts/refresh-manifest.mjs --write` at the coordinator merge step. This updates only those two derived manifest fields. Review changed section IDs before accepting new headings or links.

## Develop

```
npm ci
npm test
npm run dev      # http://localhost:5173
npm run build    # -> dist/, including 46 static article pages
npm run test:build
npm run preview
```

## Deploy

Vercel auto-detects Vite. `vercel.json` serves prebuilt article directories directly, rewrites standalone SPA views to `index.html`, and sets cache headers for `/content` and `/assets`. Non-production Git branches get protected preview deployments; do not promote until the release gates in `IMPLEMENTATION-STATUS.md` pass.

## Ask ChatGPT about a passage

Select any text in the reader and a small toolbar appears: **Ask ChatGPT ↗** and **Post on X ↗**.
Ask opens a box where you type a question, then hands the whole thing to ChatGPT in a new tab
via `https://chatgpt.com/?q=…`, which prefills and submits it against your own logged-in
account. The prompt carries the passage, the volume/file/section it came from, and a deep link
back to that exact section, e.g.

```
Why did OPEC keep pricing oil in dollars?

Passage from Vol. II — After Gold, file 02 — Oil, Petrodollars and Stagflation, 1973–1982,
section "The policy response and its failure (1974–79)":
```(passage)```

Source: https://…/#/after/02-oil-petrodollars-and-stagflation-1973-1982/the-policy-response-…
```

Leave the question empty and it asks "Explain this passage: what is it claiming, and why does
it matter?". **Copy prompt** is there as a fallback if a very long selection makes the URL
unwieldy. The passage is capped at 1,200 characters.

### Why the answer is not inline

Answering inside the page requires an OpenAI **API key** — a login cannot substitute for one.
"Sign in with ChatGPT" (and Google sign-in, and any other OAuth) returns an identity only; it
grants no model usage on a ChatGPT Plus/Pro plan, and API billing is separate from a ChatGPT
subscription. So the choices are: send the question to ChatGPT (what this does, no key, no
cost beyond your plan), or put an API key in a `OPENAI_API_KEY` env var behind a Vercel
function and a login gate. The second is a small change — a `/api/ask` edge function plus a
panel that streams the answer — if that trade is ever worth making.

## Differences from the design prototype

- **Search box restored.** The prototype's search view (`#/search`) had no input left
  after the sidebar was removed, so the feature was unreachable. It is back in the header.
- **Jump links fixed.** `parseHash` treated `#/arc/arc-5`, `#/timeline/<era>`,
  `#/glossary/<term>` etc. as `vol/slug` and rendered a blank page. The first segment is
  now matched against the known views before falling through to a file route.
- **Mobile header.** Below 640px the header wraps to two rows and the nav scrolls
  sideways, instead of pushing the page wider than the viewport. Sticky offsets
  (the arc band, the right-hand TOC, anchor scrolling) are measured off the header
  rather than hard-coded at 52px.

Presentation and content have since been edited for the shorter home, chronology, monetary mechanics and several scoped evidence corrections. `IMPLEMENTATION-STATUS.md` records what was reviewed and what remains open.
