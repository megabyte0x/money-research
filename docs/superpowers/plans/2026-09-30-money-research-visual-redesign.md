# Money Research Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete Money Research website easier to navigate, scan, and read at desktop, tablet, and phone sizes while retaining its evidence-first editorial identity.

**Architecture:** The site renders crawlable HTML in `src/static-pages.js` during the Vite build, then replaces that markup with a React view from `src/App.jsx`. Each redesigned route must use shared content or presentation models, and the static and React shells must have matching initial geometry. Keep long-form research content in its existing Markdown and metadata files; change presentation and navigation around it.

**Tech Stack:** Vite 5, React 18, native CSS, Node's built-in test runner, existing build and prerender scripts. No new UI framework or animation dependency.

**Spec:** `VISUAL-DESIGN-AUDIT.md`

## Global Constraints

- Preserve canonical URL paths, route slugs, anchor IDs, primary navigation labels, the Money Research wordmark, research copy, citations, metadata, and existing analytics behavior.
- Keep Newsreader for reading text, IBM Plex Mono for short metadata, the warm paper/ink palette, sharp geometry, and the current light/dark theme behavior.
- A claim or comparison cell remains unpublished until the existing acceptance checks allow it; do not invent charts, figures, photographs, sources, or editorial conclusions.
- Static HTML must remain useful without JavaScript. The initial static view and interactive view should show the same page identity, counts, and section order.
- Test at viewport widths **390, 820, and 1280px**, in light and dark themes. Also inspect the **640, 1024, and 1120px** navigation boundaries.
- Use existing local content and CSS; avoid third-party component packages. Keep `prefers-reduced-motion` support and visible keyboard focus.
- Do not modify `public/content/*.md`, `public/content/*.json`, `src/seo.js`, `src/routes.js`, or generated OG cards for a visual-only change unless a failing acceptance check proves it necessary.

## File map and boundaries

| File | Responsibility in this plan |
| --- | --- |
| `src/navigation.js` **(new)** | One list of primary destinations and a current-route helper for the React and static headers. |
| `src/styles.css` | Global type, spacing, color tokens; shared shell/header/footer classes; static first-paint styles. |
| `src/App.jsx` | Header/menu state, route-aware navigation, shared shell and side rail, route composition. Keep research data parsing where it is until a task extracts a focused model. |
| `src/static-pages.js` | Static markup that follows the same page structure and presentation classes as React. Preserve crawlable content and exact route links. |
| `src/features/reader/ReaderViews.jsx` and `reader.css` | Home and chapter layout. |
| `src/features/reader/volume-overview.js` **(new)** | Pure model for four volume landing pages using the existing manifest and `HOME_COPY`. |
| `src/features/reader/VolumeOverview.jsx` **(new)** | Curated volume landing presentation; the source directory remains available below it. |
| `src/features/comparison/presentation.js` **(new)** | Pure accepted/pending row grouping shared by static and React views. |
| `src/features/comparison/Comparison.jsx` and `comparison.css` | Responsive comparison table/cards and evidence-state styling. |
| `src/features/timeline/presentation.js` **(new)** | Pure turning-point selection and era grouping shared by static and React views. |
| `src/features/timeline/timeline.css` **(new)** | Era and event layout, especially phone date placement. |
| `src/features/mechanics/data.js` **(new)** | Shared captions, four transaction flow labels, and balance-sheet rows for React and static mechanics pages. |
| `src/MoneyMechanics.jsx` | Four accurate transaction diagrams; retain current text and source links and read the existing balance-sheet rows from the shared data. |
| `src/features/discovery/DiscoveryViews.jsx` and `discovery.css` | Search, glossary, sources, and takeaways scanning patterns. |
| `tests/navigation.test.mjs`, `tests/volume-overview.test.mjs`, `tests/comparison-presentation.test.mjs`, `tests/timeline-presentation.test.mjs` **(new)** | Behavior/model tests that protect navigation, volume inventory, evidence states, and timeline parity. |
| `tests/static-output.test.mjs` and `tests/mechanics.test.mjs` | Existing build-output checks extended only where markup or no-JavaScript behavior changes. |

The work is one coordinated rollout because every route shares the shell and type system. Tasks 3-7 are independently reviewable page families after Tasks 1-2 establish the foundation.

---

### Task 1: Make navigation visible at tablet widths

**Files:**
- Create: `src/navigation.js`
- Create: `tests/navigation.test.mjs`
- Modify: `src/App.jsx:139-143, 503-520, 709-731`
- Modify: `src/static-pages.js:316-323`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `PRIMARY_NAV: Array<{view: string, label: string, href: string}>` and `isCurrentNav(view: string, currentView: string): boolean`.
- Consumed by: static chrome in Task 2 and the publication footer in Task 7.

- [ ] **Step 1: Write the failing navigation model test**

```js
// tests/navigation.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { PRIMARY_NAV, isCurrentNav } from '../src/navigation.js';

test('all seven primary destinations remain visible in one route list', () => {
  assert.deepEqual(PRIMARY_NAV.map(item => item.href), [
    '/', '/compare/', '/arc/', '/timeline/', '/takeaways/', '/glossary/', '/sources/'
  ]);
  assert.equal(isCurrentNav('arc', 'arc'), true);
  assert.equal(isCurrentNav('home', 'arc'), false);
});
```

- [ ] **Step 2: Run it and confirm it fails for the missing module**

```bash
node --test tests/navigation.test.mjs
```

- [ ] **Step 3: Add the model and use it in both headers**

```js
// src/navigation.js
export const PRIMARY_NAV = Object.freeze([
  { view: 'home', label: 'Start here', href: '/' },
  { view: 'compare', label: 'Compare', href: '/compare/' },
  { view: 'arc', label: 'History', href: '/arc/' },
  { view: 'timeline', label: 'Timeline', href: '/timeline/' },
  { view: 'takeaways', label: 'Takeaways', href: '/takeaways/' },
  { view: 'glossary', label: 'Glossary', href: '/glossary/' },
  { view: 'sources', label: 'Sources', href: '/sources/' },
]);
export const isCurrentNav = (view, currentView) => view === currentView;
```

In `App.jsx`, add `compactNav: narrow` to `renderVals()`. Show the existing Menu button when `v.compactNav` is true, use it to reveal a full-width wrapped nav row, and change Escape handling from `this.state.mobile` to `this.state.narrow`. Keep the Files selector hidden only below 640px. Render links from `PRIMARY_NAV` with `aria-current={isCurrentNav(item.view, r.view) ? 'page' : undefined}`. In `siteChrome()`, render the same `PRIMARY_NAV` links in a desktop nav and a native `<details class="site-menu-details"><summary>Menu</summary><nav aria-label="Primary">…</nav></details>` at compact widths. This makes static navigation operable without JavaScript and gives it the same initially closed geometry as the React menu. Give both menu controls a 40px minimum target and match their alignment and padding.

```css
/* src/styles.css: replace the invisible narrow nav scroll treatment */
.site-nav a[aria-current="page"]{color:var(--fg);text-decoration:underline;text-underline-offset:5px}
.site-menu,.site-menu-details{display:none}
@media(max-width:1119px){
  .site-header{flex-wrap:wrap}
  .site-menu,.site-menu-details{display:block;margin-left:auto}
  .site-menu,.site-menu-details summary{min-height:40px;padding:8px 12px;border:1px solid var(--rule);box-sizing:border-box}
  .site-nav{flex-basis:100%;overflow:visible;white-space:normal}
  .site-nav[hidden]{display:none}
}
```

- [ ] **Step 4: Verify the model and the actual breakpoint**

```bash
node --test tests/navigation.test.mjs
npm run build
```

In @Browser, inspect 640, 820, 1024, 1120, and 1280px. At 820px all seven links must be reachable from the visible Menu, the header must not scroll sideways, and the active route must be discernible without color alone. Repeat with keyboard Tab/Enter/Escape.

- [ ] **Step 5: Commit the independently working navigation**

```bash
git add src/navigation.js src/App.jsx src/static-pages.js src/styles.css tests/navigation.test.mjs VISUAL-DESIGN-AUDIT.md
git commit -m "fix(ui): expose primary navigation on tablet"
```

### Task 2: Align the static and interactive shell and title system

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.jsx:708-735, 735-805`
- Modify: `src/static-pages.js:92-110, 122-163, 316-323`
- Modify: `tests/static-output.test.mjs`

**Interfaces:**
- Consumes: `PRIMARY_NAV` from Task 1.
- Produces: shared classes `site-shell`, `site-header`, `site-main`, `page-title`, `page-title--display`, `page-title--chapter`, and `page-kicker`. Later tasks use these classes.

- [ ] **Step 1: Add a build-output test for matching page identity**

```js
test('static first paint uses the interactive publication shell', () => {
  for (const path of ['index.html', 'gold/08-why-the-dollar-replaced-gold/index.html', 'compare/index.html', 'timeline/index.html']) {
    const html = readFileSync(join(root, 'dist', path), 'utf8');
    assert.match(html, /class="site-header"/, path);
    assert.match(html, /class="[^"]*site-main[^"]*"/, path);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
  }
});
```

- [ ] **Step 2: Build and confirm the new assertion fails**

```bash
npm run build
node --test tests/static-output.test.mjs
```

- [ ] **Step 3: Set shared visual tokens and apply the same shell geometry**

```css
/* src/styles.css */
:root{
  --measure:72ch;
  --page-width:820px;
  --rail-width:240px;
  --space-1:8px;
  --space-2:16px;
  --space-3:24px;
  --space-4:40px;
  --space-5:64px;
}
.site-shell{min-height:100dvh;display:flex;flex-direction:column}
.site-main{box-sizing:border-box;width:100%;max-width:var(--page-width);min-width:0;margin-inline:auto;padding:40px clamp(16px,4vw,56px) 120px}
.page-kicker{font:400 13px/1.5 'IBM Plex Mono',monospace;color:var(--mut);margin:0 0 16px}
.page-title{font:500 clamp(2rem,3.6vw,2.75rem)/1.12 'Newsreader',Georgia,serif;letter-spacing:-.015em}
.page-title--display{font-size:clamp(2.5rem,5vw,4.2rem)}
.page-title--chapter{font-size:clamp(2rem,3.5vw,2.5rem)}
```

Put `site-shell` on the React root; `site-main` on React `<main>` and static `<main>` elements. Keep the current body colors as the source of truth. Use the role classes for home/methods/mechanics/comparison display titles, article titles, and reference titles. Make static `siteChrome()` use the same header height/padding and retain crawlable links. Keep the static breadcrumb only if the interactive route also displays it; for chapters, add the breadcrumb to React above metadata rather than deleting a useful static navigation path.

- [ ] **Step 4: Rebuild, run tests, and inspect cold loads**

```bash
npm run build
node --test tests/static-output.test.mjs tests/release-routes.test.mjs
```

Cold reload home and one chapter in @Browser at 390 and 1280px. The wordmark/header, title, summary position, and first section should occupy approximately the same space before and after React boots; the chapter must remain readable if JavaScript is disabled.

- [ ] **Step 5: Commit the shell**

```bash
git add src/styles.css src/App.jsx src/static-pages.js tests/static-output.test.mjs
git commit -m "feat(ui): unify publication shell and title hierarchy"
```

### Task 3: Make the homepage and four volume landings useful entry points

**Files:**
- Create: `src/features/reader/volume-overview.js`
- Create: `src/features/reader/VolumeOverview.jsx`
- Create: `tests/volume-overview.test.mjs`
- Modify: `src/features/reader/ReaderViews.jsx`
- Modify: `src/features/reader/reader.css`
- Modify: `src/static-pages.js:92-153`
- Modify: `src/App.jsx:550-597, 738-749`

**Interfaces:**
- Produces: `volumeOverview(vol: string, manifest: Article[], articleMetadata: Record<string, Metadata>): {vol, title, question, chapters: Array<{id, num, title, href, minutes, question}>}`.
- Consumed by: React `VolumeOverview` and `staticArticle()` for directory records. The source directory body remains in an expandable `details` element below the chapter list.

- [ ] **Step 1: Write the volume model test**

```js
// tests/volume-overview.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { volumeOverview } from '../src/features/reader/volume-overview.js';

const manifest = JSON.parse(readFileSync(new URL('../public/content/manifest.json', import.meta.url)));
test('each volume opens with human chapter titles and a real first chapter', () => {
  for (const vol of ['gold', 'after', 'bitcoin', 'zcash']) {
    const view = volumeOverview(vol, manifest, {});
    assert.ok(view.question.length > 20);
    assert.ok(view.chapters.length >= 9);
    assert.ok(view.chapters[0].href.startsWith('/' + vol + '/'));
    assert.ok(view.chapters.every(chapter => !chapter.title.endsWith('.md') && chapter.num !== '00'));
  }
});
```

- [ ] **Step 2: Confirm it fails before adding the model**

```bash
node --test tests/volume-overview.test.mjs
```

- [ ] **Step 3: Add the model and both presentations**

```js
// src/features/reader/volume-overview.js
import { HOME_COPY } from '../../page-copy.js';
import { contentRole, shortTitle } from '../discovery/catalog.js';
import { canonicalPath } from '../../routes.js';

const TITLES = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin', zcash: 'Zcash' };
export function volumeOverview(vol, manifest, articleMetadata = {}) {
  if (!TITLES[vol]) throw new Error('Unknown volume: ' + vol);
  return {
    vol, title: TITLES[vol], question: HOME_COPY.volumeQuestions[vol],
    chapters: manifest.filter(item => item.vol === vol && contentRole(item) === 'topic')
      .map(item => ({
        id: item.id, num: item.num, title: shortTitle(item),
        href: canonicalPath(item), minutes: Math.max(1, Math.round(item.words / 230)),
        question: articleMetadata[item.id]?.summary?.question || ''
      }))
  };
}
```

In `VolumeOverview.jsx`, render a short volume title/question, “Start with” link to `chapters[0]`, and an ordered chapter list with title, minutes, and an approved summary question when present; place the existing directory Markdown body inside `<details className="volume-provenance"><summary>Research directory and provenance</summary>…</details>`. `staticArticle()` must render the same overview/list for `isDirectoryRecord(record)` using `model.articleMetadata`, with the existing directory body inside matching `details`. Render one primary `<h1>` for the overview, demote the directory's original `<h1>` to `<h2>` inside `details`, and preserve its original `id` so existing anchors still work. Keep the directory canonical route and all section IDs inside those blocks.

Move the four volume links directly after the homepage hero in both `HomePage` and `staticHome`. Use a 2×2 desktop grid and one column on phone. Change `.question-grid` from auto-fit three-plus-one to two columns above 640px, one below. Give “Four jobs” one compact visual matrix and use existing text for its labels. Do not add unsupported figures or rewrite the research summary.

```css
.reader-home{max-width:920px}
.reader-volumes,.question-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px}
.reader-volume{min-height:150px;padding:20px;border-top:2px solid var(--fg)}
.reader-volume-cue{font-size:12px;color:var(--mut)}
@media(max-width:639px){.reader-volumes,.question-grid{grid-template-columns:1fr}.reader-volume{min-height:0}}
```

- [ ] **Step 4: Verify links and visual balance**

```bash
node --test tests/volume-overview.test.mjs
npm run build
node --test tests/static-output.test.mjs tests/release-routes.test.mjs
```

Inspect homepage and `/gold/`, `/after/`, `/bitcoin/`, `/zcash/` at 390 and 1280px. There must be four balanced volume entries, no orphan fourth question, no `File 00` heading in the primary view, and a usable no-JavaScript directory.

- [ ] **Step 5: Commit the entry points**

```bash
git add src/features/reader src/App.jsx src/static-pages.js tests/volume-overview.test.mjs
git commit -m "feat(ui): curate homepage and volume overviews"
```

### Task 4: Make comparison evidence readable on phones

**Files:**
- Create: `src/features/comparison/presentation.js`
- Create: `tests/comparison-presentation.test.mjs`
- Modify: `src/features/comparison/Comparison.jsx`
- Modify: `src/features/comparison/comparison.css`
- Modify: `src/static-pages.js:236-259`

**Interfaces:**
- Produces: `comparisonRows({useId, perspectiveId, cells, claims, sources}): Array<{arrangement, accepted, cell}>`. `accepted` must call the existing `publishableCell`; no view may infer acceptance from non-empty text.
- Consumed by: desktop table, phone panels, and the default static comparison.

- [ ] **Step 1: Write the evidence-state model test**

```js
// tests/comparison-presentation.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { comparisonRows } from '../src/features/comparison/presentation.js';

test('pending arrangements keep their research path and cannot become accepted by text alone', () => {
  const rows = comparisonRows({ useId: 'saving', perspectiveId: 'household', cells: {}, claims: {}, sources: {} });
  assert.equal(rows.length, 6);
  assert.ok(rows.every(row => !row.accepted && row.arrangement.research.startsWith('/')));
});
```

- [ ] **Step 2: Confirm the test fails for the missing presentation module**

```bash
node --test tests/comparison-presentation.test.mjs
```

- [ ] **Step 3: Share the row model; render cards at phone widths**

```js
// src/features/comparison/presentation.js
import { ARRANGEMENTS, publishableCell } from './model.js';

export function comparisonRows({ useId, perspectiveId, cells, claims, sources }) {
  return ARRANGEMENTS.map(arrangement => {
    const cell = cells[arrangement.id + ':' + useId + ':' + perspectiveId];
    return { arrangement, accepted: publishableCell(cell, claims, sources), cell };
  });
}
```

Use the returned rows for the existing semantic desktop table and a second `<div className="comparison-panels">` phone presentation. Each panel must show the arrangement name, “What the evidence supports,” and “Limits and sources”; a pending panel must show the research chapter link. Keep exactly the same `cell.text`, `cell.scope`, `cell.uncertainty`, and citation links as the desktop table. In `staticCompare()`, render the default panel markup after the table so no-JavaScript phone users can read all columns. Group pending rows under a “Evidence still pending” subheading **without removing their individual research links**.

```css
.comparison-panels{display:none}
@media(max-width:639px){
  .comparison-feature-scroll{display:none}
  .comparison-panels{display:grid;gap:18px}
  .comparison-panel{border-top:1px solid var(--fg);padding:16px 0}
  .comparison-panel h2{margin:0 0 12px;font-size:1.35rem}
  .comparison-panel-label{font:400 12px/1.5 'IBM Plex Mono',monospace;color:var(--mut)}
}
```

- [ ] **Step 4: Verify both evidence paths and layouts**

```bash
node --test tests/comparison-presentation.test.mjs tests/comparison-cells.test.mjs
npm run build
node --test tests/static-output.test.mjs
```

At 390px, choose each Use and Perspective combination and verify the last citation and limit are visible without horizontal scrolling. At 1280px, verify the table still has correct headers and accepted cases remain scoped. Cold reload `/compare/`: title, default controls, and pending/accepted state must not jump to a different story.

- [ ] **Step 5: Commit the comparison view**

```bash
git add src/features/comparison src/static-pages.js tests/comparison-presentation.test.mjs
git commit -m "feat(ui): make comparison evidence readable on phones"
```

### Task 5: Give static and interactive timelines the same starting view

**Files:**
- Create: `src/features/timeline/presentation.js`
- Create: `src/features/timeline/timeline.css`
- Create: `tests/timeline-presentation.test.mjs`
- Modify: `src/App.jsx:382-445, 606-615, 750-795`
- Modify: `src/static-pages.js:285-314`
- Modify: `tests/static-output.test.mjs`

**Interfaces:**
- Produces: `selectTimelineEvents(model: {manifest, blocks}, options: {showAll: boolean}): Array<{id, vol, date, eventText, significance, sort, year, prominent, sources, refs}>` and `groupTimelineEvents(events): Array<{id, label, gloss, rows}>`. Every row starts with `refs: []` so it satisfies `mergeSharedEvents()`; App decorates references after selection.
- Consumed by: `App.timelineGroups()` and `staticTimeline()`. Keep `rowRefs()` and citation rendering in App; the pure selector owns only selection, sorting, and grouping.

- [ ] **Step 1: Write a parity test from the built content model**

```js
// tests/timeline-presentation.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectTimelineEvents, groupTimelineEvents } from '../src/features/timeline/presentation.js';

const model = JSON.parse(readFileSync(new URL('../public/content/index.json', import.meta.url)));
test('turning points are a stable ordered subset of all events', () => {
  const selected = selectTimelineEvents(model, { showAll: false });
  const all = selectTimelineEvents(model, { showAll: true });
  assert.ok(selected.length > 100 && selected.length < all.length);
  assert.ok(selected.every(row => all.some(candidate => candidate.id === row.id)));
  assert.deepEqual(selected.map(row => row.sort), [...selected.map(row => row.sort)].sort((a, b) => a - b));
  assert.equal(groupTimelineEvents(selected).flatMap(group => group.rows).length, selected.length);
});
```

- [ ] **Step 2: Generate the content model, then run the failing test**

```bash
node scripts/build-content.mjs
node --test tests/timeline-presentation.test.mjs
```

- [ ] **Step 3: Extract the existing selection policy without changing it**

Move the exact `big` and `bitcoinBig` expressions, date parsing (`eventYear`/`eventSortValue` from `src/timeline.js`), Bitcoin future-event exclusion, `mergeSharedEvents` call, and nine era boundaries from `App.timelineGroups()` into `presentation.js`. Use the current App filter for tables whose first header is `Date`; do not accidentally include unrelated tables. Keep event IDs and source labels unchanged. `App.timelineGroups()` calls `groupTimelineEvents(selectTimelineEvents(this.state, {showAll: !!this.state.tlAll}))`, then adds existing `rowRefs` and inline formatting. `staticTimeline()` calls the same functions with `showAll: false` and renders the same era headings and event classes. Put the remaining all-events list behind a native `<details>` with the summary “Show all events without JavaScript” so crawlable detail remains available without contradicting the initial 117-turning-point view. Do not repeat event `id` attributes in that expanded list; only the initial turning-point items own those anchors.

For unresolved destinations, have `rowRefs()` return `{status: 'pending', label: 'Destination review pending'}` without an `href` when neither a checked chapter section nor `source_timeline_fallback_reviewed` applies. Keep `{status: 'reviewed', href, label}` for checked sections and reviewed source fallbacks. Change the event renderer from an unconditional link to:

```jsx
{ref.status === 'pending'
  ? <span className="timeline-reference-pending">Destination review pending</span>
  : <a href={ref.href}>{ref.label}</a>}
```

The reviewed source fallback and checked chapter links remain links. Include `status` in the reference cache key or clear that cache on content refresh. Add era panels/spacing in `timeline.css`; replace the inline event grid styles with classes so the phone media query can actually move the date above the body instead of fighting inline `gridTemplateColumns`.

```css
@media(max-width:639px){
  .timeline-event{display:block;padding:18px 0;border-bottom:1px solid var(--rule)}
  .timeline-event-date{display:block;text-align:left;font-size:13px;margin:0 0 8px}
  .timeline-event-marker{display:none}
}
```

- [ ] **Step 4: Test the model, build, and inspect the longest view**

```bash
node --test tests/timeline-presentation.test.mjs tests/timeline-coverage.test.mjs
npm run build
node --test tests/static-output.test.mjs
```

Cold reload `/timeline/` at 390 and 1280px. First paint and hydrated view must show the same turning-point count and era order. Activate “Show all events,” inspect a middle era and the 2026 end, then check that pending destinations are text rather than self-links.

- [ ] **Step 5: Commit timeline parity**

```bash
git add src/features/timeline src/App.jsx src/static-pages.js tests/timeline-presentation.test.mjs tests/static-output.test.mjs
git commit -m "feat(ui): align timeline first paint and mobile layout"
```

### Task 6: Add accurate visual aids to the money mechanics explainer

**Files:**
- Create: `src/features/mechanics/data.js`
- Modify: `src/MoneyMechanics.jsx`
- Modify: `src/styles.css`
- Modify: `src/static-pages.js:260-284`
- Modify: `tests/mechanics.test.mjs`

**Interfaces:**
- Produces: `MECHANICS_TRANSACTIONS` with the four existing captions and balance-sheet row arrays plus flow labels; four `<figure className="money-flow">` illustrations keyed to `mechanics-loan`, `mechanics-payment`, `mechanics-bond`, and `mechanics-qe`.
- Consumed by: no later task. The existing tables remain the precise accounting record.

- [ ] **Step 1: Add a built-page check that each transaction has a labeled figure and a matching table**

```js
test('each built mechanics section pairs a flow figure with the balance-sheet table', () => {
  const html = readFileSync(join(rootPath, 'dist/mechanics/index.html'), 'utf8');
  for (const id of ['loan', 'payment', 'bond', 'qe']) {
    const section = html.split('id="mechanics-' + id + '"')[1]?.split('</section>')[0] || '';
    assert.match(section, /<figure class="money-flow"/, id);
    assert.match(section, /<figcaption>/, id);
    assert.match(section, /<table/, id);
  }
});
```

- [ ] **Step 2: Build and confirm the figure assertion fails**

```bash
npm run build
node --test tests/mechanics.test.mjs
```

- [ ] **Step 3: Extract the table rows and render four same-content flow figures**

Move each current `<Changes>` caption and `rows` array from `src/MoneyMechanics.jsx` into `MECHANICS_TRANSACTIONS` in `data.js`, keyed by `loan`, `payment`, `bond`, and `qe`. Render React `<Changes caption={...} rows={...} />` from that data so the accounting text stays identical. `staticMechanics()` currently has **no balance-sheet tables**; add one semantic `<table>` per transaction from the same data, escaping cell text with `escapeHtml()`. Insert it after the matching explanatory paragraph. Add one semantic figure before each React `<Changes>` and before each static table. Use these exact relationship labels, with no quantitative claim beyond the existing stylised £100:

```js
const FLOWS = {
  loan: ['Lending bank', 'Creates a £100 deposit and a £100 loan claim', 'Borrower'],
  payment: ['Bank A', 'Moves £100 of reserves; customer deposit moves', 'Bank B'],
  bond: ['Investor', 'Exchanges a £100 deposit for a new government bond', 'Government'],
  qe: ['Central bank', 'Buys an existing £100 bond; creates bank reserves', 'Pension fund via bank'],
};
```

The caption under each figure states that it is a simplified flow and points the reader to the adjacent table for the complete asset/liability entries. Use CSS Grid and real text, not a pseudo-chart or decorative SVG. Ensure the QE figure also states that the pension fund receives a bank deposit and that the bank owes it, matching the current table. Check that the figures and tables appear in the same order in React and static HTML.

- [ ] **Step 4: Rebuild and review accuracy with the existing tables**

```bash
npm run build
node --test tests/mechanics.test.mjs tests/static-output.test.mjs
```

At 390 and 1280px, follow the four figures in order; confirm arrows/reading order do not imply reserves are household deposits or that a bond issue is the same as QE. Check the no-JavaScript page and dark theme.

- [ ] **Step 5: Commit the explainer visuals**

```bash
git add src/features/mechanics/data.js src/MoneyMechanics.jsx src/styles.css src/static-pages.js tests/mechanics.test.mjs
git commit -m "feat(ui): illustrate four money transactions"
```

### Task 7: Improve reference scanning, side navigation, and page endings

**Files:**
- Modify: `src/features/discovery/DiscoveryViews.jsx`
- Modify: `src/features/discovery/discovery.css`
- Modify: `src/features/reader/reader.css`
- Modify: `src/App.jsx:690-704, 795-811`
- Modify: `src/static-pages.js:163-218, 316-323`
- Modify: `src/styles.css`
- Modify: `tests/static-output.test.mjs`

**Interfaces:**
- Consumes: `PRIMARY_NAV` and shared tokens from Tasks 1-2.
- Produces: site-wide `<footer className="site-footer">` and shared reference grouping classes. No changes to research data or route names.

- [ ] **Step 1: Add a meaningful footer/link check to the built output**

```js
test('every page family ends with research and volume navigation', () => {
  for (const path of ['index.html', 'gold/index.html', 'gold/08-why-the-dollar-replaced-gold/index.html', 'sources/index.html']) {
    const html = readFileSync(join(root, 'dist', path), 'utf8');
    const footer = html.split('<footer class="site-footer"')[1] || '';
    assert.match(footer, /href="\/methods\/"/, path);
    assert.match(footer, /href="\/mechanics\/"/, path);
    assert.match(footer, /href="\/sources\/"/, path);
    assert.match(footer, /href="\/zcash\/"/, path);
  }
});
```

- [ ] **Step 2: Build and confirm the footer test fails**

```bash
npm run build
node --test tests/static-output.test.mjs
```

- [ ] **Step 3: Apply a shared reference rhythm and intentional ending**

Use `.discovery-result`, `.discovery-definition`, `.discovery-summary`, and `.sources-volume` to create clearer section spacing and title/body contrast. Increase long mono evidence text to a readable size and let source URLs wrap:

```css
.discovery-result,.discovery-definition,.discovery-summary{padding-block:24px}
.discovery-result-label,.discovery-meta{font-size:13px;line-height:1.5}
.discovery-summary h2{font-size:clamp(1.35rem,2.4vw,1.7rem);line-height:1.25}
.sources-view .source-url{white-space:normal;overflow-wrap:anywhere}
.site-footer{border-top:1px solid var(--rule);padding:32px clamp(16px,4vw,56px);font:400 13px/1.6 'IBM Plex Mono',monospace}
.site-footer nav{display:flex;flex-wrap:wrap;gap:12px 24px}
```

Render the same footer links in React and `wrapStatic()`: Money Research home, all four volume directories, Money mechanics, Research method, Sources. On chapter pages keep the existing previous/next navigation before the footer. Widen the desktop contents rail from 210px to `var(--rail-width)` and make its link text at least 13px. Add `tocObserver` alongside the existing `stageObserver` in `App.jsx`: after a route or content load, observe the current `v.toc` target IDs with `rootMargin: '-20% 0px -65% 0px'`; store the first visible target ID as `activeTocId`; add `aria-current="location"` and an underline or left rule to the matching rail link; disconnect the observer on route changes and unmount. Skip links whose target is absent. Retain the phone `Contents and chapters` selector.

- [ ] **Step 4: Run the release checks and inspect reference pages**

```bash
npm run build
npm test
node --test tests/static-output.test.mjs
```

Review `/search/?q=gold`, `/takeaways/`, `/glossary/`, `/sources/`, a long chapter, and the 404 page at 390, 820, and 1280px. Verify search highlighting, source links, glossary definitions, chapter section anchors, the end-of-page path, and both themes. Long source URLs must wrap without page overflow.

- [ ] **Step 5: Commit the reference and ending system**

```bash
git add src/features/discovery src/features/reader/reader.css src/App.jsx src/static-pages.js src/styles.css tests/static-output.test.mjs
git commit -m "feat(ui): improve reference scanning and publication endings"
```

## Final verification gate

After Task 7, run `npm run test:release` once. Inspect home, all four hubs, one chapter from each volume, comparison, arc, timeline, takeaways, glossary, sources, mechanics, methods, search, and 404 in @Browser. Use 390, 820, and 1280px; additionally inspect header changes at 640, 1024, and 1120px. Test both themes, keyboard navigation, reduced motion, a cold reload, and no-JavaScript static output. Record any remaining visual discrepancy in the audit before declaring the redesign complete. Stop after the required release gate and targeted visual checks pass.

## Spec coverage check

- Header visibility and active state: Task 1.
- Static/React first-paint shell and title hierarchy: Task 2; route-specific parity in Tasks 3-5.
- Homepage, four volume cards, directories, orphan question: Task 3.
- Phone comparison and repetitive pending cells: Task 4.
- Timeline rhythm, phone dates, pending self-links, 420/117 mismatch: Task 5.
- Mechanics visual teaching aid: Task 6.
- Dense reference pages, narrow rail, missing footer/Methods/Mechanics wayfinding: Task 7. Mechanics remains linked contextually from home and chapters and appears with Methods and Sources in the footer.
- Brand identity: Tasks 2-3 and 7 use the existing mark, type, and palette with a more coherent volume and publication rhythm. Licensed historical imagery is excluded from this implementation because the audit requires real sourcing and no such asset set is approved; it can be a separate content project.
- Existing SEO, citations, route slugs, and evidence gates: Global Constraints plus the build and release checks in every affected task.
