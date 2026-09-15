import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createContentModel } from '../src/content-model.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const timelineEventIds = JSON.parse(readFileSync(join(root, 'public/content/timeline-event-ids.json'), 'utf8'));
const timelineReviewStatus = JSON.parse(readFileSync(join(root, 'public/content/timeline-review-status.json'), 'utf8'));
const comparisonCells = JSON.parse(readFileSync(join(root, 'public/content/comparison-cells.json'), 'utf8'));

test('built browser index and static pages use the same validated source model', () => {
  const documents = Object.fromEntries(manifest.map(record =>
    [record.path, readFileSync(join(root, 'public', record.path), 'utf8')]));
  const observations = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const sources = JSON.parse(readFileSync(join(root, 'public/content/sources.json'), 'utf8'));
  const claims = JSON.parse(readFileSync(join(root, 'public/content/claims.json'), 'utf8'));
  const articleMetadata = JSON.parse(readFileSync(join(root, 'public/content/article-metadata.json'), 'utf8'));
  const expected = createContentModel(manifest, documents, observations, timelineEventIds, { sources, claims }, articleMetadata, timelineReviewStatus, comparisonCells);
  const browserIndex = JSON.parse(readFileSync(join(root, 'dist/content/index.json'), 'utf8'));
  assert.deepEqual(browserIndex, expected);
  const timeline = readFileSync(join(root, 'dist/gold/10-master-timeline/index.html'), 'utf8');
  assert.match(timeline, /Gold reaches \$5,405\/oz/);
  assert.doesNotMatch(timeline, /\{\{obs:/);
  const source = readFileSync(join(root, 'dist/content/resolved/gold/10-master-timeline.md'), 'utf8');
  assert.match(source, /Gold reaches \$5,405\/oz/);
  assert.doesNotMatch(source, /\{\{obs:/);
});

test('approved summaries and curated section links appear in crawlable chapters', () => {
  const gold = readFileSync(join(root, 'dist/gold/03-from-metal-to-money-weights-rings-coins/index.html'), 'utf8');
  assert.match(gold, /What changed when weighed metal became stamped coin\?/);
  assert.match(gold, /gold\/05-silver-copper-bronze-and-bimetallism\/\?section=the-gold-silver-ratio-through-time/);
  const after = readFileSync(join(root, 'dist/after/07-financial-crisis-and-the-age-of-qe-2007-2019/index.html'), 'utf8');
  assert.match(after, /Housing-credit losses, leverage and fragile funding contributed to the crisis/);
  assert.match(after, /after\/09-pandemic-inflation-and-weaponized-reserves-2020-2026\/\?section=pandemic-fiscal-spending-and-central-bank-balance-sheets/);
});

test('source chapters expose publisher URLs as links in crawlable HTML', () => {
  const after = readFileSync(join(root, 'dist/after/13-sources/index.html'), 'utf8');
  assert.match(after, /<a href="https:\/\/www\.bankofengland\.co\.uk\/-\/media\/boe\/files\/quarterly-bulletin\/2014\/money-creation-in-the-modern-economy\.pdf">/);
  const bitcoin = readFileSync(join(root, 'dist/bitcoin/16-sources/index.html'), 'utf8');
  assert.match(bitcoin, /<a href="https:\/\/www\.govinfo\.gov\/content\/pkg\/PLAW-119publ27\/html\/PLAW-119publ27\.htm">/);
});

test('each article has a direct HTML page with unique canonical metadata', () => {
  for (const record of manifest) {
    const path = join(root, 'dist', record.vol, record.slug, 'index.html');
    assert.ok(existsSync(path), record.id);
    const html = readFileSync(path, 'utf8');
    const url = `https://money-research-iota.vercel.app/${record.vol}/${record.slug}/`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), record.id);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), record.id);
    assert.ok(html.includes('<meta name="description"'), record.id);
    assert.ok(html.includes('<main class="static-article">'), record.id);
    assert.ok(html.includes('<h1 id="'), record.id);
    if (record.h2.length) assert.ok(html.includes('<nav class="static-toc" aria-label="Chapter contents">'), record.id);
    for (const alias of record.aliases) {
      const aliasPath = join(root, 'dist', record.vol, alias, 'index.html');
      assert.ok(existsSync(aliasPath), `${record.id} alias ${alias}`);
      assert.ok(readFileSync(aliasPath, 'utf8').includes(`<link rel="canonical" href="${url}">`));
    }
  }
});

test('sitemap covers the homepage and all 44 article routes', () => {
  const xml = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
  assert.equal((xml.match(/<url>/g) || []).length, 45);
  for (const record of manifest) assert.ok(xml.includes(`/${record.vol}/${record.slug}/`), record.id);
});

test('generated internal article links and section targets resolve', () => {
  const pages = new Map(manifest.map(record => [
    `/${record.vol}/${record.slug}/`,
    readFileSync(join(root, 'dist', record.vol, record.slug, 'index.html'), 'utf8')
  ]));
  const aliases = new Map(manifest.flatMap(record => record.aliases.map(alias =>
    [`/${record.vol}/${alias}/`, `/${record.vol}/${record.slug}/`]
  )));
  let checked = 0;
  let chapterLinks = 0;
  let sectionLinks = 0;
  for (const [pagePath, html] of pages) {
    for (const [, rawHref] of html.matchAll(/<a\s+[^>]*href="([^"]+)"/g)) {
      const href = rawHref.replaceAll('&amp;', '&');
      if (href.startsWith('#/') || href.startsWith('mailto:')) continue;
      const url = new URL(href, `https://money-research-iota.vercel.app${pagePath}`);
      if (url.origin !== 'https://money-research-iota.vercel.app') continue;
      if (url.pathname === '/') { checked++; continue; }
      const canonical = aliases.get(url.pathname) || url.pathname;
      const target = pages.get(canonical);
      assert.ok(target, `${pagePath} → ${href}: missing article`);
      const section = url.searchParams.get('section') || decodeURIComponent(url.hash.slice(1));
      if (section) {
        assert.ok(target.includes(`id="${section}"`), `${pagePath} → ${href}: missing section`);
        sectionLinks++;
      }
      checked++;
      chapterLinks++;
    }
  }
  assert.ok(checked >= manifest.length, `expected at least one internal link per article, got ${checked}`);
  assert.ok(chapterLinks >= 50, `expected crawlable chapter cross-references, got ${chapterLinks}`);
  assert.ok(sectionLinks >= 100, `expected validated chapter-section links, got ${sectionLinks}`);
});

test('cross-reference links expose chapter names rather than bare file numbers', () => {
  const html = readFileSync(join(root, 'dist/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026/index.html'), 'utf8');
  assert.match(html, /<a href="\/after\/06-wars-invasions-and-money-1971-2026\/"[^>]*>“Wars, Invasions and Money[^<]*”<\/a>/);
  assert.doesNotMatch(html, /<a href="\/after\/06-wars-invasions-and-money-1971-2026\/"[^>]*>06<\/a>/);
});
