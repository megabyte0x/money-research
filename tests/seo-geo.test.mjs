import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DISCOVERY_VIEWS, hashToPath, parseLocation, redirectRules, sharedViewForRecord, vercelConfig } from '../src/routes.js';
import { SITE } from '../src/site-config.js';
import { HOME_COPY, METHODS_COPY } from '../src/page-copy.js';
import { staticArticle } from '../src/static-pages.js';
import { applyDocumentMeta, indexablePages, jsonLdGraph, resolvePage, robotsTxt, seoTitle, snippet } from '../src/seo.js';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const articleMetadata = JSON.parse(readFileSync(join(root, 'public/content/article-metadata.json'), 'utf8'));
const claims = JSON.parse(readFileSync(join(root, 'public/content/claims.json'), 'utf8'));
const modelMetadata = JSON.parse(readFileSync(join(root, 'dist/content/index.json'), 'utf8')).articleMetadata;

function html(rel) {
  return readFileSync(join(dist, rel), 'utf8');
}

test('production origin is the goldtozcash custom domain', () => {
  assert.equal(SITE.origin, 'https://goldtozcash.com');
});

test('static home and hubs have introduction text and ordinary volume/chapter links', () => {
  const home = html('index.html');
  assert.match(home, /How money works/);
  assert.match(home, /<a href="\/gold\/"/);
  assert.match(home, /<a href="\/after\/01-the-break-1971-1976\/"/);
  assert.match(home, /<a href="\/bitcoin\/02-what-bitcoin-solved-and-what-it-did-not\/"/);
  assert.match(home, /<a href="\/zcash\/02-what-zcash-is-and-what-is-live\/"/);
  assert.doesNotMatch(home, /href="\/#\/home"/);
  for (const vol of ['gold', 'after', 'bitcoin', 'zcash']) {
    const hub = html(`${vol}/index.html`);
    assert.match(hub, /<h1 id="/);
    assert.match(hub, /Chapters in this volume/);
    assert.match(hub, new RegExp(`<link rel="canonical" href="${SITE.origin}/${vol}/">`));
  }
});

test('chapter pages keep unique canonicals, one H1, and specific descriptions', () => {
  const seen = new Set();
  for (const record of manifest.filter(item => item.slug !== '00-readme' && !sharedViewForRecord(item))) {
    const page = html(`${record.vol}/${record.slug}/index.html`);
    const canonical = `${SITE.origin}/${record.vol}/${record.slug}/`;
    assert.equal([...page.matchAll(/<link rel="canonical"/g)].length, 1, record.id);
    assert.ok(page.includes(`href="${canonical}"`), record.id);
    assert.equal([...page.matchAll(/<h1 /g)].length, 1, record.id);
    const description = page.match(/<meta name="description" content="([^"]*)"/)?.[1];
    assert.ok(description && !description.startsWith(`${record.title.replace(/^\d+\s+—\s+/, '')}. A research chapter`), record.id);
    assert.ok(!seen.has(description), record.id);
    seen.add(description);
    const graph = JSON.parse(page.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.ok(graph['@graph'].some(node => node['@type'] === 'Article'), record.id);
  }
});

test('prerendered structured data is owned by the client page updater', () => {
  const output = applyDocumentMeta('<html><head></head><body></body></html>', resolvePage({ kind: 'home' }));
  const scripts = [...output.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.match(scripts[0][1], /data-seo="page"/, 'The client updater must reuse the static graph rather than append a second one');
  assert.equal(JSON.parse(scripts[0][2])['@graph'][0].url, 'https://goldtozcash.com/');
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
  assert.match(html('sources/index.html'), /"@type":"CollectionPage"/);
});

test('sitemap and robots follow the indexability registry', () => {
  const xml = html('sitemap.xml');
  const robots = html('robots.txt');
  const indexable = indexablePages(manifest, {});
  for (const page of indexable) assert.ok(xml.includes(`<loc>${page.canonical}</loc>`), page.path);
  assert.ok(!xml.includes('/search/'));
  for (const view of DISCOVERY_VIEWS) {
    assert.ok(xml.includes(`/${view}/</loc>`), view);
    assert.match(html(`${view}/index.html`), /content="index, follow"/, view);
  }
  assert.match(xml, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.match(html('llms.txt'), /^# Money Research\n\n> /);
  assert.equal(robots, robotsTxt());
  assert.ok(robots.includes(`Sitemap: ${SITE.origin}/sitemap.xml`));
  assert.match(html('search/index.html'), /content="noindex, follow"/);
  assert.ok(!html('search/index.html').includes('content="index, follow"'));
});

test('aliases are redirects in host config, not duplicate copies', () => {
  const rules = redirectRules(manifest);
  const config = JSON.parse(html('redirects.json'));
  assert.deepEqual(config, rules);
  const cloudflare = new Set(html('_redirects').trim().split('\n'));
  assert.equal(cloudflare.size, rules.length * 2);
  for (const rule of rules) {
    assert.ok(cloudflare.has(`${rule.source} ${rule.destination} 308`));
    assert.ok(cloudflare.has(`${rule.source.replace(/\/$/, '')} ${rule.destination} 308`));
  }
  const vercel = vercelConfig(manifest);
  assert.equal(vercel.rewrites, undefined);
  assert.ok(rules.some(rule => rule.source === '/gold/00-readme/' && rule.destination === '/gold/' && rule.permanent));
  assert.ok(rules.some(rule => rule.source === '/bitcoin/01/' && rule.destination === '/bitcoin/01-the-origin-what-2008-produced/'));
  assert.ok(rules.some(rule => rule.source === '/gold/11-glossary/' && rule.destination === '/glossary/' && rule.permanent));
  assert.ok(rules.some(rule => rule.source === '/after/13-sources/' && rule.destination === '/sources/' && rule.permanent));
  assert.ok(rules.some(rule => rule.source === '/bitcoin/14-master-timeline-2008-2026/' && rule.destination === '/timeline/' && rule.permanent));
  assert.ok(existsSync(join(dist, '404.html')));
  assert.match(html('404.html'), /Page not found/);
});

test('approved answers expose source locators from accepted claims', () => {
  const after = html('after/01-the-break-1971-1976/index.html');
  assert.match(after, /class="answer-sources"/);
  assert.match(after, /"citation":\[/);
  const citations = modelMetadata['after-01'].citations;
  assert.ok(citations.length > 0);
  const claimIds = new Set(claims.filter(claim => claim.reviewState === 'accepted').map(claim => claim.id));
  for (const citation of citations) {
    assert.ok(claimIds.has(citation.claimId), citation.claimId);
    assert.match(citation.url, /^https:\/\//);
    assert.ok(citation.locator);
    assert.ok(after.includes(citation.url), 'Readers can follow the same source used in metadata');
    assert.ok(after.includes(citation.locator.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')), 'Readers can locate the supporting passage');
  }
  assert.equal((modelMetadata['gold-01'].citations || []).length, 0);
  const editorial = Object.fromEntries(articleMetadata.map(row => [row.id, row]));
  assert.ok(editorial['after-01'].citations.some(item => item.claimId === 'E31-official-gold-window-1971'));
});

test('prerendered chapter HTML contains no hash-route hrefs', () => {
  for (const record of manifest.filter(item => item.slug !== '00-readme' && !sharedViewForRecord(item))) {
    const page = html(`${record.vol}/${record.slug}/index.html`);
    assert.doesNotMatch(page, /href="\/#\//, record.id);
  }
});

test('crawlable chapter HTML leads with the title and answer before the review notice', () => {
  const record = {
    id: 'gold-01',
    vol: 'gold',
    slug: '01-the-metal-itself',
    num: '01',
    title: '01 — The Metal Itself',
    sectionAliases: {},
  };
  const html = staticArticle(record, {
    manifest: [record],
    blocks: {
      '01-the-metal-itself@gold': [
        { type: 'h1', id: 'title', text: '01 — The Metal Itself' },
        { type: 'h2', id: 'origin', text: 'Origin' },
        { type: 'p', text: 'Body paragraph.' },
      ],
    },
    articleMetadata: {
      'gold-01': { summary: { question: 'What about gold?', answer: 'Gold is durable and workable.' } },
    },
  }, { breadcrumbs: [{ name: 'Money Research', path: '/' }] });
  const h1 = html.indexOf('<h1');
  const answer = html.indexOf('Gold is durable and workable.');
  assert.ok(h1 >= 0 && answer > h1, 'H1 then answer lead the chapter for search snippets');
  assert.doesNotMatch(html, /editorial review/);
});

test('titles and descriptions fit search result limits', () => {
  assert.equal(seoTitle('Short'), 'Short · Money Research');
  assert.equal(seoTitle('Oil, Petrodollars and Stagflation, 1973–1982: The First Decade Without an Anchor'), 'Oil, Petrodollars and Stagflation, 1973–1982 · Money Research');
  assert.equal(snippet('One. Two.'), 'One. Two.');
  assert.ok(snippet('a '.repeat(200)).length <= 160);
  for (const page of indexablePages(manifest, articleMetadata)) {
    // Brand suffix may truncate in SERPs; the chapter name itself must fit.
    assert.ok(page.title.replace(' · Money Research', '').length <= 70, `${page.path}: ${page.title}`);
    assert.ok(page.description.length <= 160, `${page.path}: ${page.description.length}`);
  }
  const article = jsonLdGraph(resolvePage({ kind: 'chapter', record: manifest.find(r => r.id === 'gold-01'), articleMetadata }))['@graph'][0];
  assert.ok(article.datePublished && article.dateModified && article.image && article.author && article.publisher);
});

test('library size in SEO copy matches the manifest', () => {
  assert.match(HOME_COPY.description, new RegExp(`${manifest.length} documents`));
  assert.match(METHODS_COPY.sections[0].paragraphs[0], new RegExp(`${manifest.length} research documents`));
});

test('home fallback and prerendered metadata keep sharing copy concise and separate from search copy', () => {
  const shell = readFileSync(join(root, 'index.html'), 'utf8');
  const home = resolvePage({ kind: 'home' });
  assert.notEqual(home.socialTitle, home.title);
  assert.ok(home.socialDescription.length <= 100);
  for (const output of [shell, html('index.html')]) {
    assert.ok(output.includes(`<title>${home.title.replaceAll('&', '&amp;')}</title>`));
    assert.ok(output.includes(`<meta name="description" content="${HOME_COPY.description}">`));
    assert.ok(output.includes(`<meta property="og:title" content="${HOME_COPY.socialTitle}">`));
    assert.ok(output.includes(`<meta property="og:description" content="${HOME_COPY.socialDescription}">`));
    assert.ok(output.includes(`<meta name="twitter:title" content="${HOME_COPY.socialTitle}">`));
    assert.ok(output.includes(`<meta name="twitter:description" content="${HOME_COPY.socialDescription}">`));
  }
});

test('prerendered chapters lead with the title and answer before the review notice', () => {
  const page = html('gold/01-the-metal-itself/index.html');
  const main = page.slice(page.indexOf('<main'));
  const h1 = main.indexOf('<h1');
  const answer = main.indexOf('Gold is durable, workable and sometimes found in native form');
  assert.ok(h1 >= 0 && answer > h1);
  assert.doesNotMatch(main, /under (editorial )?review/);
});

test('legacy hashes translate to real paths while keeping destination and section', () => {
  assert.equal(hashToPath('#/home'), '/');
  assert.equal(hashToPath('#/methods'), '/methods/');
  assert.equal(hashToPath('#/gold/08-why-the-dollar-replaced-gold/the-nixon-shock'), '/gold/08-why-the-dollar-replaced-gold/#the-nixon-shock');
  assert.equal(hashToPath('#/search?q=QE&vol=after'), '/search/?q=QE&vol=after');
  assert.equal(hashToPath('#/bitcoin/00', manifest), '/bitcoin/');
  assert.equal(hashToPath('#/gold/11-glossary', manifest), '/glossary/');
  const parsed = parseLocation({ pathname: '/gold/03-from-metal-to-money-weights-rings-coins/', search: '?section=stage-one-metal-by-weight-c-3000-650-bce', hash: '' }, manifest);
  assert.equal(parsed.view, 'article');
  assert.equal(parsed.sec, 'stage-one-metal-by-weight-c-3000-650-bce');
  assert.equal(parseLocation({ pathname: '/after/13-sources/', search: '', hash: '' }, manifest).view, 'sources');
});

const seoMetadata = JSON.parse(readFileSync(join(root, 'public/content/seo-metadata.json'), 'utf8'));

function graphOf(page) {
  return JSON.parse(page.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
}

function unescapeHtml(text) {
  return text.replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
}

test('every chapter has its own search title and an untruncated description', () => {
  const chapters = manifest.filter(item => item.slug !== '00-readme' && !sharedViewForRecord(item));
  for (const record of chapters) {
    const override = seoMetadata.chapters[record.id];
    assert.ok(override, `${record.id}: missing seo-metadata entry`);
    const page = resolvePage({ kind: 'chapter', record, articleMetadata: modelMetadata });
    assert.equal(page.title, `${override.title} · Money Research`, record.id);
    assert.equal(page.description, override.description, `${record.id}: description was shortened`);
  }
  for (const page of indexablePages(manifest, modelMetadata)) {
    assert.doesNotMatch(page.description, /…$/, `${page.path}: truncated description`);
  }
  assert.match(resolvePage({ kind: 'chapter', record: manifest.find(r => r.id === 'after-01'), articleMetadata: modelMetadata }).title, /Nixon shock.*gold/i);
  assert.match(resolvePage({ kind: 'home' }).title, /gold.*fiat.*Bitcoin.*Zcash/i);
});

test('home serves a visible FAQ that matches its FAQPage markup, plus a site search action', () => {
  const page = html('index.html');
  const graph = graphOf(page);
  const faq = graph.find(node => node['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, HOME_COPY.faq.length);
  const main = unescapeHtml(page.slice(page.indexOf('<main')));
  for (const item of faq.mainEntity) {
    assert.ok(main.includes(item.name), `question not visible: ${item.name}`);
    assert.ok(main.includes(item.acceptedAnswer.text), `answer not visible: ${item.name}`);
  }
  assert.ok(faq.mainEntity.some(item => /fiat/i.test(item.name)) && faq.mainEntity.some(item => /Zcash/.test(item.name)));
  const site = graph.find(node => node['@type'] === 'WebSite');
  assert.equal(site.potentialAction['@type'], 'SearchAction');
  assert.equal(site.potentialAction.target.urlTemplate, `${SITE.origin}/search/?q={search_term_string}`);
  assert.ok(main.indexOf('Start the story') < main.indexOf('The story in four steps'), 'one primary call to action leads the page');
});

test('chapters with an approved answer carry it as FAQPage markup; others open with their own takeaways', () => {
  const approved = graphOf(html('bitcoin/04-countries-that-adopted-bitcoin-and-what-happened/index.html'));
  const faq = approved.find(node => node['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity[0].name, modelMetadata['bitcoin-04'].summary.question);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, modelMetadata['bitcoin-04'].summary.answer);

  const zcash = html('zcash/02-what-zcash-is-and-what-is-live/index.html');
  assert.ok(!graphOf(zcash).some(node => node['@type'] === 'FAQPage'), 'no FAQ without an approved answer');
  const main = zcash.slice(zcash.indexOf('<main'));
  const brief = main.indexOf('In brief');
  assert.ok(brief > main.indexOf('<h1') && brief < main.indexOf('<h2 id="network-currency-and-technology-are-different-things"'), 'summary leads the chapter');
  assert.ok(main.slice(brief).includes('The current case for Zcash must account for Ironwood'), 'summary quotes the chapter takeaways');
});

test('glossary exposes every term as a DefinedTerm', () => {
  const graph = graphOf(html('glossary/index.html'));
  const set = graph.find(node => node['@type'] === 'DefinedTermSet');
  const model = JSON.parse(readFileSync(join(dist, 'content/index.json'), 'utf8'));
  assert.equal(set.hasDefinedTerm.length, model.glossary.length);
  const fiat = set.hasDefinedTerm.find(term => term.name === 'Fiat money');
  assert.match(fiat.description, /without a fixed legal promise to redeem/);
  assert.equal(fiat.url, `${SITE.origin}/glossary/#fiat-money`);
});

test('static chapters end with previous and next chapter links', () => {
  const page = html('after/01-the-break-1971-1976/index.html');
  const nav = page.slice(page.indexOf('aria-label="Previous and next chapter"'));
  assert.match(nav, /← Previous<\/span><a href="\/after\/">After Gold: overview<\/a>/);
  assert.match(nav, /Next →<\/span><a href="\/after\/02-oil-petrodollars-and-stagflation-1973-1982\/">/);
  assert.match(page, /Volume II · After Gold · Chapter 1</);
});

test('reader-facing pages use reader language, not review-status jargon', () => {
  for (const rel of ['index.html', 'compare/index.html', 'arc/index.html', 'after/01-the-break-1971-1976/index.html']) {
    const main = html(rel).slice(html(rel).indexOf('<main'));
    assert.doesNotMatch(main, /Evidence pending|evidence-pending|Editor-approved|remain withheld|File \d/, rel);
  }
});

test('fonts are self-hosted and the body font is preloaded', () => {
  const page = html('index.html');
  assert.doesNotMatch(page, /fonts\.(googleapis|gstatic)\.com/);
  assert.match(page, /<link rel="preload" href="\/assets\/newsreader-latin-wght-normal-[^"]+\.woff2" as="font" type="font\/woff2" crossorigin>/);
});
