import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const origin = 'https://money-research-iota.vercel.app';
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

function metadata(html, name, attribute = 'name') {
  const tag = html.match(new RegExp(`<meta\\s+${attribute}="${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}"\\s+content="([^"]*)"`));
  return tag?.[1];
}

function page(record, slug = record.slug) {
  if (record.slug === '00-readme' && slug === record.slug) {
    const file = join(dist, record.vol, 'index.html');
    assert.ok(existsSync(file), `${record.id}: missing volume hub`);
    return readFileSync(file, 'utf8');
  }
  const file = join(dist, record.vol, slug, 'index.html');
  assert.ok(existsSync(file), `${record.id}: missing ${slug} direct page`);
  return readFileSync(file, 'utf8');
}

test('every direct destination and numeric alias has one canonical, unique article identity', () => {
  assert.equal(manifest.length, 44, 'expected the reviewed 44-article inventory');
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const chapters = manifest.filter(record => record.slug !== '00-readme');
  for (const record of chapters) {
    const html = page(record);
    const canonical = `${origin}/${record.vol}/${record.slug}/`;
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    const description = metadata(html, 'description');
    assert.ok(title && title.includes('Money Research'), `${record.id}: missing title`);
    assert.ok(description && description.length >= 40, `${record.id}: missing useful description`);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${record.id}: wrong canonical`);
    assert.equal(metadata(html, 'og:url', 'property'), canonical, `${record.id}: wrong OG URL`);
    assert.equal(metadata(html, 'og:title', 'property'), title, `${record.id}: OG title differs`);
    assert.equal(metadata(html, 'og:description', 'property'), description, `${record.id}: OG description differs`);
    assert.ok(!titles.has(title), `${record.id}: duplicate title`);
    assert.ok(!descriptions.has(description), `${record.id}: duplicate description`);
    assert.ok(!canonicals.has(canonical), `${record.id}: duplicate canonical`);
    titles.add(title); descriptions.add(description); canonicals.add(canonical);
    const main = html.match(/<main[^>]*class="[^"]*static-article[^"]*"[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main && /<h1 id="[^"]+">/.test(main), `${record.id}: no-JavaScript chapter is absent`);
    for (const alias of record.aliases) {
      const aliasPath = join(dist, record.vol, alias, 'index.html');
      assert.equal(existsSync(aliasPath), false, `${record.id}: alias ${alias} must not duplicate HTML`);
    }
  }
  assert.equal(titles.size, chapters.length);
  assert.equal(canonicals.size, chapters.length);
});

test('crawlable section links land on their exact chapter section', () => {
  const canonical = new Map(manifest.filter(record => record.slug !== '00-readme').map(record => [`/${record.vol}/${record.slug}/`, record]));
  const alias = new Map([
    ...manifest.flatMap(record => record.aliases.map(slug =>
      [`/${record.vol}/${slug}/`, record.slug === '00-readme' ? `/${record.vol}/` : `/${record.vol}/${record.slug}/`])),
    ...manifest.filter(record => record.slug === '00-readme').map(record => [`/${record.vol}/00-readme/`, `/${record.vol}/`]),
  ]);
  let sectionLinks = 0;
  for (const record of manifest.filter(item => item.slug !== '00-readme')) {
    const html = page(record);
    for (const [, rawHref] of html.matchAll(/<a\s+[^>]*href="([^"]+)"/g)) {
      const href = rawHref.replaceAll('&amp;', '&');
      assert.ok(!/^(?:javascript|data|vbscript):/i.test(href), `${record.id}: unsafe link scheme ${href}`);
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const url = new URL(href, origin);
      const target = canonical.get(alias.get(url.pathname) || url.pathname);
      if (!target) continue;
      const section = url.searchParams.get('section') || decodeURIComponent(url.hash.slice(1));
      if (!section) continue;
      assert.ok(section.length > 0, `${record.id}: empty section URL`);
      assert.ok(page(target).includes(`id="${section}"`), `${record.id}: ${href} has no target`);
      sectionLinks++;
    }
  }
  assert.ok(sectionLinks >= 100, `expected 100+ crawlable section links; found ${sectionLinks}`);
});

test('social previews use one public image for home and all article routes', () => {
  const pages = [readFileSync(join(dist, 'index.html'), 'utf8'), ...manifest.map(record => page(record))];
  for (const [index, html] of pages.entries()) {
    const label = index === 0 ? 'home' : manifest[index - 1].id;
    const image = metadata(html, 'og:image', 'property');
    assert.ok(image, `${label}: missing og:image`);
    const url = new URL(image, origin);
    assert.equal(url.origin, origin, `${label}: social image must be on the canonical origin`);
    assert.ok(existsSync(join(dist, url.pathname.slice(1))), `${label}: social image asset missing`);
    assert.equal(metadata(html, 'twitter:image'), image, `${label}: Twitter preview image differs`);
  }
});
