# Gold → Dollar · research notes

A research reader over 27 markdown files in two volumes (Vol. I *Gold*, Vol. II *After Gold*),
built from the Claude Design handoff in `project/` and `chats/`.

## Stack

Vite + React 18, no router library — the prototype's hash routes are kept as-is:

| Route | View |
| --- | --- |
| `#/arc` | The arc — nine monetary regimes with ten SVG charts; `#/arc/arc-5` jumps to a regime |
| `#/research` | Index of both volumes, each file with reading time and the question it answers |
| `#/timeline` | Master timeline, turning points by default, `Show all events` for all 191 |
| `#/takeaways` | Skim mode — the "Key takeaways" of every file |
| `#/glossary` | 84 terms; `#/glossary/<term-id>` jumps to one |
| `#/<vol>/<slug>[/<section>]` | A file, e.g. `#/gold/07-the-gold-standard-era-1717-1971` |
| `#/search` | Full-text search across every file (header search box) |

## Content

The markdown lives in `public/content/` with `manifest.json` listing every file
(volume, slug, title, word count, h2 headings). It is fetched and parsed in the
browser at load by `src/md.js` — the same minimal parser the design prototype used.
To add or edit a chapter, drop the `.md` in `public/content/<vol>/` and add its
manifest entry; nothing else needs to change.

## Develop

```
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Deploy

Static build; Vercel auto-detects Vite. `vercel.json` rewrites unknown paths to
`index.html` and sets cache headers for `/content` and `/assets`.

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
