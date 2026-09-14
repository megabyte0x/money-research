import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseMd } from '../src/md.js';
import { eventYear, eventSortValue, mergeSharedEvents, sharedEventId } from '../src/timeline.js';
import { indexObservations, resolveObservations } from '../src/observations.js';
import { createContentModel } from '../src/content-model.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

test('validated content model resolves articles, glossary and related-file references once', () => {
  const documents = Object.fromEntries(manifest.map(record =>
    [record.path, readFileSync(join(root, 'public', record.path), 'utf8')]));
  const observations = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const model = createContentModel(manifest, documents, observations);
  assert.equal(Object.keys(model.blocks).length, 44);
  assert.ok(model.glossary.length > 100);
  assert.match(JSON.stringify(model.blocks['10-master-timeline@gold']), /Gold reaches \$5,405\/oz/);
  assert.doesNotMatch(JSON.stringify(model), /\{\{obs:/);
  assert.deepEqual(model.fileRefs['09-gold-today-what-still-holds-its-value@gold'],
    [...new Set(model.fileRefs['09-gold-today-what-still-holds-its-value@gold'])]);
  assert.throws(() => createContentModel(manifest, { ...documents, [manifest[0].path]: undefined }, observations), /Missing article/);
});

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
    const article = readFileSync(join(root, 'public', record.path), 'utf8');
    assert.equal(record.words, article.trim().split(/\s+/).length, `${record.id} reading-length metadata`);
    const headings = parseMd(article).filter(block => block.type === 'h2');
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

test('Bitcoin supply and custody copy keeps distinct measures non-additive', () => {
  const read = num => {
    const record = manifest.find(m => m.vol === 'bitcoin' && m.num === num);
    return readFileSync(join(root, 'public', record.path), 'utf8');
  };
  const supply = read('09');
  assert.match(supply, /Dormant outputs/);
  assert.match(supply, /not additive holder categories/);
  assert.match(supply, /Bitcoin Core, `gettxoutsetinfo`/);
  assert.doesNotMatch(supply, /effective liquid supply is perhaps 3–5 million|8–9 million coins — 40–45%/);
  assert.doesNotMatch(read('07'), /effective supply is roughly 16–17 million/);
  assert.match(read('15'), /Long inactivity.*is not proof of loss/);
  assert.match(read('12'), /may omit liabilities/);
  assert.match(read('01'), /not separate coin owners/);
});

test('Bitcoin security and quantum copy distinguishes rewards, models and draft BIPs', () => {
  const read = num => {
    const record = manifest.find(m => m.vol === 'bitcoin' && m.num === num);
    return readFileSync(join(root, 'public', record.path), 'utf8');
  };
  assert.match(read('11'), /block subsidy \*\*plus\*\* transaction fees/);
  assert.match(read('11'), /not a measured current attack threshold/);
  assert.match(read('09'), /BIP-361 remains a draft informational proposal/);
  assert.match(read('12'), /does not mechanically halve fees/);
  assert.match(read('15'), /not itself the cost of acquiring/);
  assert.match(read('14'), /not activated Bitcoin rules/);
  for (const num of ['08', '09', '11', '12']) {
    assert.doesNotMatch(read(num), /quantum migration is the first deadline|2030–33|confiscate Satoshi's/, `bitcoin-${num}`);
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

test('E10 gold-price observations are dated and agree across the three volume timelines', () => {
  const observations = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const indexed = indexObservations(observations);
  const byId = Object.fromEntries(indexed);
  assert.equal(observations.length, new Set(observations.map(o => o.id)).size);
  for (const observation of observations) {
    assert.ok(Number.isFinite(observation.value));
    assert.match(observation.unit, /USD per troy ounce/);
    assert.match(observation.period, /^2026-\d\d-\d\d$/);
    assert.match(observation.source, /^https:\/\/www\.gold\.org\/goldhub\/research\//);
    assert.equal(observation.verification, 'verified against publisher table');
    assert.ok(observation.method && observation.scope && observation.accessed && observation.revision);
    assert.ok(observation.denominator && observation.sourceLocator && observation.uncertainty && observation.claimId);
  }
  const record = byId['gold-usd-2026-record-high'];
  const july = byId['gold-usd-2026-july-end'];
  const august = byId['gold-usd-2026-august-end'];
  assert.equal(record.period, '2026-01-29');
  assert.equal(july.period, '2026-07-31');
  assert.equal(august.period, '2026-08-31');
  for (const path of [
    'content/gold/09-gold-today-what-still-holds-its-value.md',
    'content/gold/10-master-timeline.md',
    'content/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026.md',
    'content/after/11-master-timeline-1971-2026.md',
    'content/bitcoin/14-master-timeline-2008-2026.md'
  ]) {
    const source = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(source, /\{\{obs:gold-usd-2026-record-high\}\}/);
    const article = resolveObservations(source, indexed);
    assert.match(article, new RegExp(record.value.toLocaleString('en-US')));
    assert.doesNotMatch(article, /\$5,58[09]|\$5,590|held above \$4,400 throughout|\$4,400–4,700 range/i);
    assert.match(article, /gold-market-commentary-july-2026/);
  }
  for (const path of [
    'content/gold/09-gold-today-what-still-holds-its-value.md',
    'content/gold/10-master-timeline.md',
    'content/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026.md',
    'content/after/11-master-timeline-1971-2026.md'
  ]) {
    const article = resolveObservations(readFileSync(join(root, 'public', path), 'utf8'), indexed);
    assert.match(article, new RegExp(july.value.toLocaleString('en-US')));
    assert.match(article, new RegExp(august.value.toLocaleString('en-US')));
  }
});

test('observation references reject missing and unverified data', () => {
  const records = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const indexed = indexObservations(records);
  for (const record of manifest) {
    const article = readFileSync(join(root, 'public', record.path), 'utf8');
    assert.doesNotMatch(resolveObservations(article, indexed), /\{\{obs:/, record.path);
  }
  assert.equal(resolveObservations('US${{obs:gold-usd-2026-record-high}}/oz', indexed), 'US$5,405/oz');
  assert.throws(() => resolveObservations('{{obs:unknown}}', indexed), /Unknown observation/);
  assert.throws(() => resolveObservations('{{obs:broken', indexed), /Malformed observation token/);
  assert.throws(() => indexObservations([...records, records[0]]), /duplicate observation ID/);
  assert.throws(() => indexObservations([{ ...records[0], verification: 'unverified' }]), /unverified observation/);
});

test('Nigeria purchase and cross-border flow shares retain different denominators', () => {
  const use = readFileSync(join(root, 'public/content/bitcoin/03-how-bitcoin-is-actually-used-global-adoption.md'), 'utf8');
  const regimes = readFileSync(join(root, 'public/content/bitcoin/07-the-supply-system-fixed-rate-variable-rate-and-backing.md'), 'utf8');
  const sources = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  for (const article of [use, regimes]) {
    assert.match(article, /89%[^.]*centralized.exchange fiat purchases|89%[^.]*fiat purchases[^.]*centralized exchanges/i);
    assert.match(article, /over 65%[^.]*2024 crypto inflows|over 65%[^.]*crypto inflows[^.]*2024/i);
    assert.match(article, /denominator|different (?:channels|transaction)/i);
    assert.match(article, /subsaharan-africa-crypto-adoption-2025/);
    assert.match(article, /1ngaea2026001\.pdf/);
    assert.doesNotMatch(article, /89% of crypto purchases were bitcoin rather than stablecoins|Argentina, Türkiye, Nigeria and Lebanon the crypto rails carried mostly dollar stablecoins/i);
  }
  assert.match(sources, /E11.*89%.*centralized exchanges/);
  assert.match(sources, /E11.*over 65%.*2024 crypto inflows/);
});

test('Bitcoin hedge and volatility conclusions do not outrun their dated evidence', () => {
  for (const path of [
    'content/bitcoin/02-what-bitcoin-solved-and-what-it-did-not.md',
    'content/bitcoin/03-how-bitcoin-is-actually-used-global-adoption.md',
    'content/bitcoin/08-why-not-gold-again.md',
    'content/bitcoin/11-defects-that-stop-bitcoin-from-being-a-global-currency.md',
    'content/bitcoin/13-is-bitcoin-the-answer.md'
  ]) {
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /matched|same dates|same source|same currency/i, path);
    assert.doesNotMatch(article, /every five.year period|every asset class|every currency|store of value over the cycle|gold is both|first hours of every crisis in which dollars are scarce|structural defects are not solvable|gold's is 9–15%/i, path);
  }
  for (const num of ['02', '03', '11']) {
    const path = manifest.find(m => m.vol === 'bitcoin' && m.num === num).path;
    const article = readFileSync(join(root, 'public', path), 'utf8');
    assert.match(article, /000201503426000008\/btc-20260630\.htm/, path);
    assert.match(article, /87,549\.41/);
    assert.match(article, /58,745\.18/);
  }
  const conclusion = readFileSync(join(root, 'public/content/bitcoin/13-is-bitcoin-the-answer.md'), 'utf8');
  assert.match(conclusion, /not evidence by itself/);
  assert.match(conclusion, /2018–23 sample/);
  assert.match(conclusion, /10% annual-volatility line.*not a necessary condition/);
  assert.match(conclusion, /Gold Mid-Year Outlook 2026/);
});

test('E15 Bitcoin-standard claims separate base supply, broad money, credit and redemption', () => {
  const standard = readFileSync(join(root, 'public/content/bitcoin/07-the-supply-system-fixed-rate-variable-rate-and-backing.md'), 'utf8');
  const gold = readFileSync(join(root, 'public/content/bitcoin/08-why-not-gold-again.md'), 'utf8');
  const crises = readFileSync(join(root, 'public/content/bitcoin/12-how-bitcoin-could-reproduce-old-crises.md'), 'utf8');
  const glossary = readFileSync(join(root, 'public/content/bitcoin/15-glossary.md'), 'utf8');
  const sources = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  assert.match(standard, /broad money growth tracks Bitcoin issuance/);
  assert.match(standard, /velocity growth is near zero/);
  assert.match(standard, /lending existing Bitcoin/);
  assert.match(standard, /not necessarily one-to-one/);
  assert.match(standard, /reserve holding.*convertibility/);
  assert.match(gold, /borrow Bitcoin/);
  assert.match(crises, /does \*\*not\*\* mean every measure of money or credit would be fixed/);
  assert.match(glossary, /Bitcoin-denominated bank claims and credit could change/);
  assert.match(sources, /E15.*Weber.*near-zero velocity growth/);
  assert.doesNotMatch(standard, /money supply is exactly 21 million|full-reserve banking[^.]*removes credit|trade at par with every other/);
  assert.doesNotMatch(standard, /El Salvador is a clean demonstration/);
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
