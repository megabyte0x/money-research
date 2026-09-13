import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseMd } from '../src/md.js';
import { eventYear, eventSortValue, mergeSharedEvents, sharedEventId } from '../src/timeline.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

test('the three-volume inventory has 44 unique, resolvable records', () => {
  assert.deepEqual(Object.fromEntries(['gold', 'after', 'bitcoin'].map(vol =>
    [vol, manifest.filter(record => record.vol === vol).length])), { gold: 13, after: 14, bitcoin: 17 });
  const ids = manifest.map(record => record.id);
  assert.equal(new Set(ids).size, 44);
  assert.equal(new Set(manifest.map(record => `${record.vol}/${record.slug}`)).size, 44);
  for (const record of manifest) {
    assert.match(record.path, /^content\/(gold|after|bitcoin)\/[a-z0-9-]+\.md$/);
    assert.equal(record.id, `${record.vol}-${record.num}`);
    assert.match(record.source, /^(gold-research|after-gold|bitcoin)\/[a-zA-Z0-9-]+\.md$/);
    assert.ok(Array.isArray(record.aliases));
    if (record.vol === 'bitcoin') assert.deepEqual(record.aliases, [record.num]);
    assert.ok(existsSync(join(root, 'public', record.path)), record.path);
    assert.ok(record.title && Number.isInteger(record.words) && record.words > 0);
    const headings = parseMd(readFileSync(join(root, 'public', record.path), 'utf8')).filter(block => block.type === 'h2');
    assert.deepEqual(headings.map(block => block.text), record.h2, `${record.id} heading manifest`);
    assert.equal(new Set(headings.map(block => block.id)).size, headings.length, `${record.id} section IDs`);
  }
});

test('reviewed timeline links point to relevant existing sections', () => {
  for (const [vol, num, section, expected] of [
    ['after', '06', '9-11-afghanistan-and-iraq-2001-21', 'Iraq'],
    ['after', '05', 'the-asian-financial-crisis-1997-98', 'Asian financial crisis']
  ]) {
    const record = manifest.find(m => m.vol === vol && m.num === num);
    const blocks = parseMd(readFileSync(join(root, 'public', record.path), 'utf8'));
    const heading = blocks.find(b => b.id === section);
    assert.ok(heading, `${vol}/${num}/${section}`);
    assert.match(heading.text, new RegExp(expected, 'i'));
  }
});

test('all volumes retain a source list and a source timeline', () => {
  for (const vol of ['gold', 'after', 'bitcoin']) {
    assert.ok(manifest.some(m => m.vol === vol && m.slug.includes('sources')));
    assert.ok(manifest.some(m => m.vol === vol && m.slug.includes('timeline')));
  }
});

test('Federal Reserve cryptocurrency survey is not presented as a global Bitcoin payment share', () => {
  for (const path of [
    'content/bitcoin/00-readme.md',
    'content/bitcoin/02-what-bitcoin-solved-and-what-it-did-not.md',
    'content/bitcoin/03-how-bitcoin-is-actually-used-global-adoption.md'
  ]) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /U\.S\. adults/);
    assert.match(article, /cryptocurrency/i);
    assert.doesNotMatch(article, /under 2% of (?:its |bitcoin )?users|payments are under 2% of use|under 2% for a payment/i);
  }
});

test('Bitcoin settlement claims distinguish confirmations from absolute finality', () => {
  for (const path of [
    'content/bitcoin/01-the-origin-what-2008-produced.md',
    'content/bitcoin/02-what-bitcoin-solved-and-what-it-did-not.md',
    'content/bitcoin/08-why-not-gold-again.md',
    'content/bitcoin/13-is-bitcoin-the-answer.md'
  ]) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /confirmations?/i, path);
    assert.match(article, /developer\.bitcoin\.org\/devguide\/payment_processing\.html#verifying-payment/, path);
    assert.doesNotMatch(article, /settles with finality in about an hour|final settlement[^.]*takes about an hour|settlement no one can reverse|settled in an hour/i, path);
    const record = manifest.find(m => m.path === path);
    assert.equal(record.words, article.trim().split(/\s+/).length, `${path} reading-length metadata`);
  }
});

test('reserve-share explanations name the incompatible COFER and gold denominators', () => {
  for (const path of [
    'content/gold/08-why-the-dollar-replaced-gold.md',
    'content/gold/09-gold-today-what-still-holds-its-value.md',
    'content/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026.md',
    'content/bitcoin/08-why-not-gold-again.md'
  ]) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /COFER/);
    assert.match(article, /excludes gold|excludes monetary gold/);
    assert.match(article, /valuation|price effect|market price|price rose/i);
  }
});

test('El Salvador legal-status summaries distinguish the amended label from legal effect', () => {
  for (const path of [
    'content/bitcoin/04-countries-that-adopted-bitcoin-and-what-happened.md',
    'content/bitcoin/06-what-legal-tender-requires-and-what-is-missing.md',
    'content/bitcoin/15-glossary.md',
    'content/after/08-innovation-cards-bitcoin-stablecoins-cbdcs.md'
  ]) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /Decree 199/);
    assert.match(article, /curso legal/);
    assert.match(article, /voluntary/i);
    assert.doesNotMatch(article, /un-made it in 2025|repealed that status in January 2025/);
    assert.doesNotMatch(article, /no country has bitcoin as legal tender|both reversed it|no country has bitcoin as legal tender in 2026/i);
  }
});

test('gold-standard ending is distinct from reserves and later reserve-basket currencies', () => {
  const paths = [
    'content/gold/00-readme.md',
    'content/gold/07-the-gold-standard-era-1717-1971.md',
    'content/gold/08-why-the-dollar-replaced-gold.md',
    'content/gold/09-gold-today-what-still-holds-its-value.md',
    'content/after/00-readme.md',
    'content/bitcoin/01-the-origin-what-2008-produced.md',
    'content/bitcoin/08-why-not-gold-again.md'
  ];
  for (const path of paths) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.doesNotMatch(article, /no legal monetary role anywhere|no official monetary role since 1976|no currency on earth|no currency is defined as a weight of gold|nothing has been money by law with a gold definition|nothing backs money except trust|gold cannot invoice a shipment|cannot create money in a crisis|cannot support a modern banking system's credit expansion/i, path);
    const record = manifest.find(m => m.path === path);
    assert.equal(record.words, article.trim().split(/\s+/).length, `${path} reading-length metadata`);
  }
  const gold = readFileSync(join(root, 'public/content/gold/07-the-gold-standard-era-1717-1971.md'), 'utf8');
  assert.match(gold, /1978 reform|Second Amendment/i);
  assert.match(gold, /ZiG/);
  assert.match(gold, /de jure floating and de facto other managed/);
  const sources = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  assert.match(sources, /E09.*pam45\/pdf\/chap2\.pdf/);
  assert.match(sources, /E09.*2024 Monetary Policy Statement/);
  assert.match(sources, /E09.*2025 Article IV Consultation/);
});

test('connected timeline orders BCE, interwar, fiat and Bitcoin events', () => {
  const dates = ['3 Jan 2009', '15 Aug 1971', 'c. 4600–4300 BCE', '1925', '31 Oct 2008'];
  assert.deepEqual(dates.sort((a, b) => eventSortValue(a) - eventSortValue(b)),
    ['c. 4600–4300 BCE', '1925', '15 Aug 1971', '31 Oct 2008', '3 Jan 2009']);
  assert.equal(eventYear('c. 6th c. BCE'), -550);
});

test('only reviewed duplicate monetary events combine their volume references', () => {
  const rows = [
    { id: 'a', vol: 'gold', year: 1971, sort: 1971.6, eventText: 'Nixon closes the gold window', refs: [{ href: '#/gold' }] },
    { id: 'b', vol: 'after', year: 1971, sort: 1971.6, eventText: 'Nixon suspends gold convertibility', refs: [{ href: '#/after' }] },
    { id: 'c', vol: 'bitcoin', year: 2009, sort: 2009.1, eventText: 'Genesis block mined', refs: [] }
  ];
  const result = mergeSharedEvents(rows);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0].sources, ['gold', 'after']);
  assert.deepEqual(result[0].refs.map(r => r.href), ['#/gold', '#/after']);
  assert.equal(sharedEventId(1997, 'Bank of England independence'), null);
});
