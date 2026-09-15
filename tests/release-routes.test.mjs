import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '../src/site-config.js';
import { canonicalPath, sharedViewForRecord } from '../src/routes.js';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const origin = SITE.origin;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const ogManifest = JSON.parse(readFileSync(join(root, 'src/generated/og-manifest.json'), 'utf8'));

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
  assert.equal(manifest.length, 63, 'expected the reviewed four-volume inventory');
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const chapters = manifest.filter(record => record.slug !== '00-readme' && !sharedViewForRecord(record));
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

test('shared glossary, sources and timelines replace their volume-specific pages', () => {
  for (const record of manifest.filter(sharedViewForRecord)) {
    assert.equal(existsSync(join(dist, record.vol, record.slug, 'index.html')), false, record.id);
    assert.equal(canonicalPath(record), `/${sharedViewForRecord(record)}/`, record.id);
  }
  for (const view of ['glossary', 'sources', 'timeline']) {
    assert.ok(existsSync(join(dist, view, 'index.html')), `${view}: missing shared page`);
  }
});

test('crawlable section links land on their exact chapter section', () => {
  const chapters = manifest.filter(record => record.slug !== '00-readme' && !sharedViewForRecord(record));
  const canonical = new Map(chapters.map(record => [`/${record.vol}/${record.slug}/`, record]));
  const alias = new Map([
    ...manifest.flatMap(record => record.aliases.map(slug =>
      [`/${record.vol}/${slug}/`, record.slug === '00-readme' ? `/${record.vol}/` : `/${record.vol}/${record.slug}/`])),
    ...manifest.filter(record => record.slug === '00-readme').map(record => [`/${record.vol}/00-readme/`, `/${record.vol}/`]),
  ]);
  let sectionLinks = 0;
  for (const record of chapters) {
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

function outputForPath(path) {
  if (path === '/') return readFileSync(join(dist, 'index.html'), 'utf8');
  if (path === '/404') return readFileSync(join(dist, '404.html'), 'utf8');
  return readFileSync(join(dist, path.slice(1), 'index.html'), 'utf8');
}

function pngDimensions(file) {
  const data = readFileSync(file);
  assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file}: not a PNG`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

test('every shareable route has a unique, versioned title-card PNG and complete static metadata', () => {
  const cards = Object.entries(ogManifest.cards || {});
  const chapters = manifest.filter(record => record.slug !== '00-readme' && !sharedViewForRecord(record));
  assert.ok(cards.length > chapters.length, 'expected cards for hubs, utilities and every chapter');
  const images = new Set();
  for (const [path, card] of cards) {
    const html = outputForPath(path);
    const label = path === '/' ? 'home' : path;
    const image = metadata(html, 'og:image', 'property');
    assert.ok(image, `${label}: missing og:image`);
    const url = new URL(image, origin);
    assert.equal(url.origin, origin, `${label}: social image must be on the canonical origin`);
    assert.equal(url.pathname, card.image, `${label}: wrong title-card image`);
    const imageFile = join(dist, url.pathname.slice(1));
    assert.ok(existsSync(imageFile), `${label}: social image asset missing`);
    assert.deepEqual(pngDimensions(imageFile), { width: 1200, height: 630 }, `${label}: wrong card dimensions`);
    assert.ok(statSync(imageFile).size < 500 * 1024, `${label}: card exceeds the delivery budget`);
    assert.ok(card.alt.length >= 20, `${label}: manifest alt text is too short`);
    assert.equal(metadata(html, 'og:image:alt', 'property'), card.alt, `${label}: wrong OG image alt`);
    assert.equal(metadata(html, 'twitter:image'), image, `${label}: Twitter preview image differs`);
    assert.equal(metadata(html, 'twitter:image:alt'), card.alt, `${label}: Twitter alt differs`);
    assert.equal(metadata(html, 'og:image:type', 'property'), 'image/png', `${label}: wrong image type`);
    assert.equal(metadata(html, 'og:image:width', 'property'), '1200', `${label}: wrong image width`);
    assert.equal(metadata(html, 'og:image:height', 'property'), '630', `${label}: wrong image height`);
    const imagePosition = html.indexOf('<meta property="og:image"');
    assert.ok(imagePosition >= 0 && imagePosition < html.indexOf('<meta property="og:image:type"')
      && imagePosition < html.indexOf('<meta property="og:image:width"')
      && imagePosition < html.indexOf('<meta property="og:image:height"')
      && imagePosition < html.indexOf('<meta property="og:image:alt"'), `${label}: image properties precede their declaration`);
    assert.ok(html.includes(`<meta property="og:site_name" content="${SITE.name}">`), `${label}: missing site name`);
    assert.doesNotMatch(html, /social-preview\.png/, `${label}: retained the single-image metadata`);
    assert.ok(!images.has(image), `${label}: card image is shared with another route`);
    images.add(image);
  }
  assert.equal(images.size, cards.length);
});
