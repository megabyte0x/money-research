import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createContentModel } from '../src/content-model.js';
import { SITE } from '../src/site-config.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const timelineEventIds = JSON.parse(readFileSync(join(root, 'public/content/timeline-event-ids.json'), 'utf8'));
const timelineReviewStatus = JSON.parse(readFileSync(join(root, 'public/content/timeline-review-status.json'), 'utf8'));
const comparisonCells = JSON.parse(readFileSync(join(root, 'public/content/comparison-cells.json'), 'utf8'));

function outputFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? outputFiles(path) : [path];
  });
}

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

test('approved summaries appear in crawlable chapters without next-step panels', () => {
  const gold = readFileSync(join(root, 'dist/gold/03-from-metal-to-money-weights-rings-coins/index.html'), 'utf8');
  assert.match(gold, /What changed when weighed metal became stamped coin\?/);
  assert.doesNotMatch(gold, /Where to read next/);
  const after = readFileSync(join(root, 'dist/after/07-financial-crisis-and-the-age-of-qe-2007-2019/index.html'), 'utf8');
  assert.match(after, /Housing-credit losses, leverage and fragile funding contributed to the crisis/);
  assert.doesNotMatch(after, /Where to read next/);
});

test('source chapters expose publisher URLs as links in crawlable HTML', () => {
  const after = readFileSync(join(root, 'dist/after/13-sources/index.html'), 'utf8');
  assert.match(after, /<a href="https:\/\/www\.bankofengland\.co\.uk\/-\/media\/boe\/files\/quarterly-bulletin\/2014\/money-creation-in-the-modern-economy\.pdf">/);
  const bitcoin = readFileSync(join(root, 'dist/bitcoin/16-sources/index.html'), 'utf8');
  assert.match(bitcoin, /<a href="https:\/\/www\.govinfo\.gov\/content\/pkg\/PLAW-119publ27\/html\/PLAW-119publ27\.htm">/);
});

test('each article has a direct HTML page with unique canonical metadata', () => {
  for (const record of manifest) {
    if (record.slug === '00-readme') {
      assert.equal(existsSync(join(root, 'dist', record.vol, record.slug, 'index.html')), false, record.id);
      const hub = readFileSync(join(root, 'dist', record.vol, 'index.html'), 'utf8');
      assert.ok(hub.includes(`<link rel="canonical" href="${SITE.origin}/${record.vol}/">`), record.id);
      continue;
    }
    const path = join(root, 'dist', record.vol, record.slug, 'index.html');
    assert.ok(existsSync(path), record.id);
    const html = readFileSync(path, 'utf8');
    const url = `${SITE.origin}/${record.vol}/${record.slug}/`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), record.id);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), record.id);
    assert.ok(html.includes('<meta name="description"'), record.id);
    assert.ok(html.includes('<main id="main-content" class="static-article">'), record.id);
    assert.ok(html.includes('<h1 id="'), record.id);
    if (record.h2.length) assert.ok(html.includes('<nav class="static-toc" aria-label="Chapter contents">'), record.id);
    for (const alias of record.aliases) {
      const aliasPath = join(root, 'dist', record.vol, alias, 'index.html');
      assert.equal(existsSync(aliasPath), false, `${record.id} alias ${alias} must not copy chapter HTML`);
    }
  }
});

test('sitemap covers the homepage and all 44 article routes', () => {
  const xml = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
  const chapters = manifest.filter(record => record.slug !== '00-readme');
  assert.equal((xml.match(/<url>/g) || []).length, 1 + 3 + 2 + chapters.length);
  assert.ok(xml.includes(`${SITE.origin}/`));
  for (const vol of ['gold', 'after', 'bitcoin']) {
    assert.ok(xml.includes(`${SITE.origin}/${vol}/`), vol);
  }
  for (const record of chapters) assert.ok(xml.includes(`/${record.vol}/${record.slug}/`), record.id);
  assert.ok(!xml.includes('/search/'));
  assert.ok(!xml.includes('/00-readme/'));
});

test('generated SEO documents do not retain the removed production host', () => {
  for (const file of outputFiles(join(root, 'dist')).filter(path => /\.(?:html|xml|txt)$/.test(path))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /https:\/\/money-research-iota\.vercel\.app/, file);
  }
});

test('generated internal article links and section targets resolve', () => {
  const pages = new Map([
    ['/', readFileSync(join(root, 'dist/index.html'), 'utf8')],
    ...['gold', 'after', 'bitcoin', 'methods', 'glossary', 'timeline', 'takeaways', 'mechanics', 'compare', 'arc', 'search']
      .map(path => [`/${path}/`, readFileSync(join(root, 'dist', path, 'index.html'), 'utf8')]),
    ...manifest.filter(record => record.slug !== '00-readme').map(record => [
      `/${record.vol}/${record.slug}/`,
      readFileSync(join(root, 'dist', record.vol, record.slug, 'index.html'), 'utf8')
    ]),
  ]);
  const aliases = new Map([
    ...manifest.flatMap(record => record.aliases.map(alias =>
      [`/${record.vol}/${alias}/`, record.slug === '00-readme' ? `/${record.vol}/` : `/${record.vol}/${record.slug}/`]
    )),
    ...manifest.filter(record => record.slug === '00-readme').map(record =>
      [`/${record.vol}/00-readme/`, `/${record.vol}/`]),
  ]);
  let checked = 0;
  let chapterLinks = 0;
  let sectionLinks = 0;
  for (const [pagePath, html] of pages) {
    for (const [, rawHref] of html.matchAll(/<a\s+[^>]*href="([^"]+)"/g)) {
      const href = rawHref.replaceAll('&amp;', '&');
      assert.ok(!href.startsWith('/#/'), `${pagePath} → ${href}: hash route`);
      if (href.startsWith('#/') || href.startsWith('mailto:')) continue;
      const url = new URL(href, `${SITE.origin}${pagePath}`);
      if (url.origin !== SITE.origin) continue;
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
