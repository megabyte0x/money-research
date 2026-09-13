import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

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
