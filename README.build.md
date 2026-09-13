# Money Research · reader implementation

A research reader over 44 Markdown files in three volumes: Gold, After Gold and Bitcoin. The original design handoff is in `project/` and `chats/`; the active site is `src/` plus `public/content/`.

## Stack

Vite + React 18, no router library. Article pages are prebuilt as crawlable HTML and also render in React; legacy hash URLs remain usable:

| Route | View |
| --- | --- |
| `/#/home` | Short introduction |
| `/#/compare` | Provisional arrangement comparison |
| `/#/arc` | Historical arc; numerical charts withheld during source audit |
| `/#/research` | Three-volume research index |
| `/#/timeline` | Connected chronology; turning points or all events |
| `/#/takeaways` | Existing chapter takeaways |
| `/#/glossary` | Aggregated glossary |
| `/#/methods` | Research scope, source lists and corrections |
| `/<vol>/<slug>/` | Crawlable article with unique metadata and canonical URL |
| `/<vol>/<slug>/?section=<id>` | Direct section link |
| `/#/<vol>/<slug>[/<section>]` | Supported legacy hash article link |
| `/#/search?q=…` | Shareable passage search |

## Content

The published Markdown is in `public/content/`. `manifest.json` records each article's stable ID, original-file provenance, volume, slug, numeric alias where applicable, title, word count and headings. Bitcoin source files in the supplied workspace are numeric; the website uses descriptive slugs. `src/md.js` parses the content, while `scripts/prerender.mjs` creates article HTML and `sitemap.xml` from the same manifest at build time. See `IMPLEMENTATION-STATUS.md` for open editorial and release gates.

## Develop

```
npm ci
npm test
npm run dev      # http://localhost:5173
npm run build    # -> dist/, including 44 static article pages
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

Everything else — type, colour, spacing, charts, copy — is carried over verbatim.
