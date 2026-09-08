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
