import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hashToPath, parseLocation, redirectRules, vercelConfig } from '../src/routes.js';
import { SITE } from '../src/site-config.js';
import { indexablePages, jsonLdGraph, resolvePage, robotsTxt } from '../src/seo.js';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const articleMetadata = JSON.parse(readFileSync(join(root, 'public/content/article-metadata.json'), 'utf8'));
const claims = JSON.parse(readFileSync(join(root, 'public/content/claims.json'), 'utf8'));
const modelMetadata = JSON.parse(readFileSync(join(root, 'dist/content/index.json'), 'utf8')).articleMetadata;

function html(rel) {
  return readFileSync(join(dist, rel), 'utf8');
}

test('production origin is the goldtozcash Vercel deployment', () => {
  assert.equal(SITE.origin, 'https://goldtozcash.vercel.app');
});

test('static home and hubs have introduction text and ordinary volume/chapter links', () => {
  const home = html('index.html');
  assert.match(home, /How money works/);
  assert.match(home, /<a href="\/gold\/"/);
  assert.match(home, /<a href="\/after\/01-the-break-1971-1976\/"/);
  assert.match(home, /<a href="\/bitcoin\/02-what-bitcoin-solved-and-what-it-did-not\/"/);
  assert.doesNotMatch(home, /href="\/#\/home"/);
  for (const vol of ['gold', 'after', 'bitcoin']) {
    const hub = html(`${vol}/index.html`);
    assert.match(hub, /<h1 id="/);
    assert.match(hub, /Chapters in this volume/);
    assert.match(hub, new RegExp(`<link rel="canonical" href="${SITE.origin}/${vol}/">`));
  }
});

test('chapter pages keep unique canonicals, one H1, and specific descriptions', () => {
  const seen = new Set();
  for (const record of manifest.filter(item => item.slug !== '00-readme')) {
    const page = html(`${record.vol}/${record.slug}/index.html`);
    const canonical = `${SITE.origin}/${record.vol}/${record.slug}/`;
    assert.equal([...page.matchAll(/<link rel="canonical"/g)].length, 1, record.id);
    assert.ok(page.includes(`href="${canonical}"`), record.id);
    assert.equal([...page.matchAll(/<h1 /g)].length, 1, record.id);
    const description = page.match(/<meta name="description" content="([^"]*)"/)?.[1];
    assert.ok(description && !description.startsWith(`${record.title.replace(/^\d+\s+—\s+/, '')}. A research chapter`), record.id);
    assert.ok(!seen.has(description), record.id);
    seen.add(description);
    const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(graph['@graph'].some(node => node['@type'] === 'Article'), record.id);
  }
});

test('JSON-LD types match page kinds from the shared resolver', () => {
  const home = jsonLdGraph(resolvePage({ kind: 'home' }));
  assert.ok(home['@graph'].some(node => node['@type'] === 'WebSite'));
  assert.ok(home['@graph'].some(node => node['@type'] === 'WebPage'));
  const hub = jsonLdGraph(resolvePage({ kind: 'hub', vol: 'gold' }), { itemList: [{ name: 'A', url: 'https://example.com/a/' }] });
  assert.ok(hub['@graph'].some(node => node['@type'] === 'CollectionPage'));
  assert.ok(hub['@graph'].some(node => node['@type'] === 'ItemList'));
  const methods = jsonLdGraph(resolvePage({ kind: 'methods' }));
  assert.ok(methods['@graph'].some(node => node['@type'] === 'AboutPage'));
  const liveHub = html('gold/index.html');
  assert.match(liveHub, /"@type":"CollectionPage"/);
  assert.match(liveHub, /"@type":"ItemList"/);
  assert.match(html('methods/index.html'), /"@type":"AboutPage"/);
});

test('sitemap and robots follow the indexability registry', () => {
  const xml = html('sitemap.xml');
  const robots = html('robots.txt');
  const indexable = indexablePages(manifest, {});
  for (const page of indexable) assert.ok(xml.includes(`<loc>${page.canonical}</loc>`), page.path);
  assert.ok(!xml.includes('/search/'));
  assert.ok(!xml.includes('/timeline/'));
  assert.ok(!xml.includes('/compare/'));
  assert.equal(robots, robotsTxt());
  assert.ok(robots.includes(`Sitemap: ${SITE.origin}/sitemap.xml`));
  assert.match(html('search/index.html'), /content="noindex, follow"/);
  assert.ok(!html('search/index.html').includes('content="index, follow"'));
});

test('aliases are redirects in host config, not duplicate copies', () => {
  const rules = redirectRules(manifest);
  const config = JSON.parse(html('redirects.json'));
  assert.deepEqual(config, rules);
  const vercel = vercelConfig(manifest);
  assert.equal(vercel.rewrites, undefined);
  assert.ok(rules.some(rule => rule.source === '/gold/00-readme/' && rule.destination === '/gold/' && rule.permanent));
  assert.ok(rules.some(rule => rule.source === '/bitcoin/01/' && rule.destination === '/bitcoin/01-the-origin-what-2008-produced/'));
  assert.ok(existsSync(join(dist, '404.html')));
  assert.match(html('404.html'), /Page not found/);
});

test('approved answers expose provenance from the evidence records', () => {
  const after = html('after/01-the-break-1971-1976/index.html');
  assert.match(after, /class="answer-sources"/);
  assert.match(after, /E31-official-gold-window-1971|Nixon|gold conversion|IMF/);
  const citations = modelMetadata['after-01'].citations;
  assert.ok(citations.length > 0);
  const claimIds = new Set(claims.filter(claim => claim.reviewState === 'accepted').map(claim => claim.id));
  for (const citation of citations) {
    assert.ok(claimIds.has(citation.claimId), citation.claimId);
    assert.match(citation.url, /^https:\/\//);
    assert.ok(citation.locator);
  }
  assert.equal((modelMetadata['gold-01'].citations || []).length, 0);
  const editorial = Object.fromEntries(articleMetadata.map(row => [row.id, row]));
  assert.ok(editorial['after-01'].citations.some(item => item.claimId === 'E31-official-gold-window-1971'));
});

test('prerendered chapter HTML contains no hash-route hrefs', () => {
  for (const record of manifest.filter(item => item.slug !== '00-readme')) {
    const page = html(`${record.vol}/${record.slug}/index.html`);
    assert.doesNotMatch(page, /href="\/#\//, record.id);
  }
});

test('legacy hashes translate to real paths while keeping destination and section', () => {
  assert.equal(hashToPath('#/home'), '/');
  assert.equal(hashToPath('#/methods'), '/methods/');
  assert.equal(hashToPath('#/gold/08-why-the-dollar-replaced-gold/the-nixon-shock'), '/gold/08-why-the-dollar-replaced-gold/#the-nixon-shock');
  assert.equal(hashToPath('#/search?q=QE&vol=after'), '/search/?q=QE&vol=after');
  assert.equal(hashToPath('#/bitcoin/00', manifest), '/bitcoin/');
  const parsed = parseLocation({ pathname: '/gold/03-from-metal-to-money-weights-rings-coins/', search: '?section=stage-one-metal-by-weight-c-3000-650-bce', hash: '' }, manifest);
  assert.equal(parsed.view, 'article');
  assert.equal(parsed.sec, 'stage-one-metal-by-weight-c-3000-650-bce');
});
