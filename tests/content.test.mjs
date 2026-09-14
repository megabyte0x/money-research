import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseMd, stripInline } from '../src/md.js';
import { eventYear, eventSortValue, mergeSharedEvents, sharedEventId, SHARED_EVENT_PAIRS } from '../src/timeline.js';
import { TIMELINE_SECTION_REFS, timelineReferenceKey } from '../src/timeline-references.js';
import { indexObservations, resolveObservations } from '../src/observations.js';
import { createContentModel } from '../src/content-model.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const timelineEventIds = JSON.parse(readFileSync(join(root, 'public/content/timeline-event-ids.json'), 'utf8'));
const idByTimelineKey = new Map(timelineEventIds.map(record => [record.key, record.id]));

test('validated content model resolves articles, glossary and related-file references once', () => {
  const documents = Object.fromEntries(manifest.map(record =>
    [record.path, readFileSync(join(root, 'public', record.path), 'utf8')]));
  const observations = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const model = createContentModel(manifest, documents, observations, timelineEventIds);
  assert.equal(Object.keys(model.blocks).length, 44);
  assert.ok(model.glossary.length > 100);
  assert.match(JSON.stringify(model.blocks['10-master-timeline@gold']), /Gold reaches \$5,405\/oz/);
  assert.doesNotMatch(JSON.stringify(model), /\{\{obs:/);
  assert.deepEqual(model.fileRefs['09-gold-today-what-still-holds-its-value@gold'],
    [...new Set(model.fileRefs['09-gold-today-what-still-holds-its-value@gold'])]);
  assert.throws(() => createContentModel(manifest, { ...documents, [manifest[0].path]: undefined }, observations, timelineEventIds), /Missing article/);
  assert.throws(() => createContentModel(manifest, documents, observations, timelineEventIds.slice(1)), /Missing or duplicate timeline event ID/);
  assert.throws(() => createContentModel(manifest, documents, observations, [...timelineEventIds, timelineEventIds[0]]), /Invalid or duplicate timeline event ID/);
  assert.throws(() => createContentModel(manifest, documents, observations,
    [...timelineEventIds, { id: 'evt-gold-0091', key: 'gold|2099|Unpublished event' }]), /Unreferenced timeline event ID/);
  const goldTimeline = model.blocks['10-master-timeline@gold'].find(block => block.type === 'table');
  assert.equal(goldTimeline.eventIds.length, goldTimeline.rows.length);
  assert.equal(goldTimeline.eventIds[0], 'evt-gold-0001');
  assert.equal(goldTimeline.eventIds.at(-1), 'evt-gold-0090');
  const changedObservations = observations.map(record => record.id === 'gold-usd-2026-july-end'
    ? { ...record, value: record.value + 1 } : record);
  const changedModel = createContentModel(manifest, documents, changedObservations, [...timelineEventIds].reverse());
  const changedTimeline = changedModel.blocks['10-master-timeline@gold'].find(block => block.type === 'table');
  assert.deepEqual(changedTimeline.eventIds, goldTimeline.eventIds, 'IDs survive changed values and registry order');
  assert.notDeepEqual(changedTimeline.rows, goldTimeline.rows, 'observation value actually changed');
  const sourceGoldTimeline = manifest.find(record => record.id === 'gold-10');
  const lines = documents[sourceGoldTimeline.path].split('\n');
  const first = lines.findIndex(line => line.startsWith('| c. 4600–4300 BCE |'));
  const second = lines.findIndex(line => line.startsWith('| c. 3000 BCE | Egypt'));
  assert.ok(first >= 0 && second >= 0);
  [lines[first], lines[second]] = [lines[second], lines[first]];
  const reordered = createContentModel(manifest,
    { ...documents, [sourceGoldTimeline.path]: lines.join('\n') }, observations, timelineEventIds);
  const reorderedTable = reordered.blocks['10-master-timeline@gold'].find(block => block.type === 'table');
  assert.deepEqual(reorderedTable.eventIds.slice(0, 2), ['evt-gold-0002', 'evt-gold-0001']);
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

test('explicit timeline references identify one source event and a real target section', () => {
  const sourceRows = new Map();
  for (const vol of ['gold', 'after', 'bitcoin']) {
    const source = manifest.find(m => m.vol === vol && m.slug.includes('timeline'));
    const tables = parseMd(readFileSync(join(root, 'public', source.path), 'utf8')).filter(b => b.type === 'table');
    for (const row of tables.flatMap(t => t.rows)) {
      const key = timelineReferenceKey(vol, stripInline(row[0]), stripInline(row[1]));
      sourceRows.set(key, (sourceRows.get(key) || 0) + 1);
    }
  }
  assert.equal(timelineEventIds.length, [...sourceRows.values()].reduce((sum, count) => sum + count, 0));
  for (const record of timelineEventIds) assert.equal(sourceRows.get(record.key), 1, `${record.key} must identify one current source row`);
  for (const [id, [vol, num, sectionId]] of Object.entries(TIMELINE_SECTION_REFS)) {
    assert.ok(timelineEventIds.some(record => record.id === id), `${id} must name a current event`);
    const target = manifest.find(m => m.vol === vol && m.num === num);
    assert.ok(target, `${id} target article`);
    const sections = parseMd(readFileSync(join(root, 'public', target.path), 'utf8'));
    assert.ok(sections.some(b => b.type === 'h2' && b.id === sectionId), `${id} target section`);
  }
  assert.deepEqual(TIMELINE_SECTION_REFS[idByTimelineKey.get('after|May 1997|Bank of England independence')],
    ['after', '04', 'the-independence-wave']);
  assert.deepEqual(TIMELINE_SECTION_REFS[idByTimelineKey.get('after|2 Jul 1997|Thai baht floats')],
    ['after', '05', 'the-asian-financial-crisis-1997-98']);
  assert.deepEqual(TIMELINE_SECTION_REFS[idByTimelineKey.get('after|Mar 2003|Iraq invaded')],
    ['after', '06', '9-11-afghanistan-and-iraq-2001-21']);
  assert.deepEqual(TIMELINE_SECTION_REFS['evt-gold-0086'], ['gold', '09', 'the-numbers']);
});

test('unrelated dated events are separate timeline rows', () => {
  const source = manifest.find(m => m.vol === 'after' && m.num === '11');
  const rows = parseMd(readFileSync(join(root, 'public', source.path), 'utf8'))
    .filter(b => b.type === 'table').flatMap(t => t.rows);
  for (const [date, event] of [
    ['Feb 1973', 'Dollar devalued again, to $42.22 per ounce'],
    ['Mar 1973', 'Major currencies float against the dollar'],
    ['15 Sep 2008', 'Lehman Brothers files for bankruptcy'],
    ['16 Sep 2008', 'Federal Reserve lends to AIG'],
    ['3 Oct 2008', 'US Congress authorizes TARP'],
    ['Late 2008', 'Federal Reserve expands dollar swap lines with foreign central banks'],
    ['Nov 2008', 'China announces a large fiscal stimulus'],
    ['Nov 2008', "G20 holds its first leaders' summit"],
    ['Nov 2008', 'Federal Reserve announces its first large-scale asset-purchase programme'],
    ['16 Dec 2008', 'Federal Reserve cuts its policy rate near zero'],
    ['8 Jun 1974', 'US–Saudi Joint Commission established'],
    ['26 Jun 1974', 'Herstatt Bank fails'],
    ['May 1997', 'Bank of England independence'],
    ['Jul 1997', 'Hong Kong handover'],
    ['31 Oct 2008', 'Bitcoin whitepaper published'],
    ['3 Jan 2009', 'Bitcoin genesis block mined']
  ]) assert.ok(rows.some(r => r[0] === date && r[1] === event), `${date}: ${event}`);
  assert.equal(rows.some(r => r[1].includes('Dollar devalued') && r[1].includes('currencies float')), false,
    'the dollar-price change is no longer bundled with the floating-rate transition');
  assert.equal(rows.some(r => r[0] === '15 Sep 2008' && /AIG|TARP|swap lines|China stimulus/.test(r[1])), false,
    'later crisis responses are not dated to Lehman bankruptcy');
  const gold = manifest.find(m => m.vol === 'gold' && m.num === '10');
  const goldRows = parseMd(readFileSync(join(root, 'public', gold.path), 'utf8'))
    .filter(b => b.type === 'table').flatMap(t => t.rows);
  for (const [date, event] of [
    ['1896', 'Bryan\'s "Cross of Gold" speech'],
    ['1896', 'Klondike gold rush'],
    ['1999', 'Gold bottoms around $252/oz'],
    ['1999–2002', 'UK auctions about half its gold reserves'],
    ['Sep 1999', 'Central Bank Gold Agreement'],
    ['31 Jul 2026', 'Gold finishes July at ${{obs:gold-usd-2026-july-end}}/oz'],
    ['31 Aug 2026', 'Gold finishes August at ${{obs:gold-usd-2026-august-end}}/oz'],
    ['2026 Q1', 'IMF COFER dollar share is {{obs:imf-cofer-usd-share-2026q1}}% of foreign-exchange reserves, excluding gold']
  ]) assert.ok(goldRows.some(r => r[0] === date && r[1] === event), `${date}: ${event}`);
  assert.doesNotMatch(goldRows.map(r => r[2]).join(' '), /Gold's official monetary role ends|Fiat era begins|Trigger for reserve diversification/);
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

test('Bitcoin institutional positions distinguish policy, research, speech and test portfolios', () => {
  const record = manifest.find(m => m.id === 'bitcoin-05');
  const article = readFileSync(join(root, 'public', record.path), 'utf8');
  assert.match(article, /authors' assessment, not an adopted ECB regulation/);
  assert.match(article, /policy guidance for members, not the domestic law/);
  assert.match(article, /academic working paper, not a Federal Reserve Board decision/);
  assert.match(article, /outside its international reserves/);
  assert.match(article, /executive direction about government-held assets, not legislation/);
  assert.doesNotMatch(article, /every international financial institution.*written its opposition into policy|— the Fed's actual position|one genuine collision is fiscal/);
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
  for (const observation of observations.filter(o => o.claimId === 'E10')) {
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

test('E04 reserve shares use separate dated observations and denominators', () => {
  const observations = JSON.parse(readFileSync(join(root, 'public/content/observations.json'), 'utf8'));
  const indexed = indexObservations(observations);
  const gold = indexed.get('ecb-gold-share-2025-end');
  const dollar = indexed.get('imf-cofer-usd-share-2026q1');
  assert.equal(gold.value, 27);
  assert.equal(gold.period, '2025-12-31');
  assert.match(gold.denominator, /foreign exchange and gold/i);
  assert.match(gold.sourceLocator, /Chart 7 panel a/);
  assert.equal(dollar.value, 57.13);
  assert.equal(dollar.period, '2026-03-31');
  assert.match(dollar.denominator, /excludes monetary gold/i);
  assert.match(dollar.sourceLocator, /share of US dollar holdings/);
  assert.notEqual(gold.denominator, dollar.denominator);
  for (const record of manifest) {
    const source = readFileSync(join(root, 'public', record.path), 'utf8');
    assert.doesNotMatch(source, /57\.13%|\b27%/, `${record.id}: literal reserve share bypasses observation`);
  }
  const goldTimeline = readFileSync(join(root, 'public/content/gold/10-master-timeline.md'), 'utf8');
  assert.match(goldTimeline, /\{\{obs:ecb-gold-share-2025-end\}\}%/);
  assert.match(goldTimeline, /\{\{obs:imf-cofer-usd-share-2026q1\}\}%/);
  const resolved = resolveObservations(goldTimeline, indexed);
  assert.match(resolved, /27% of end-2025 official reserves including gold/);
  assert.match(resolved, /57\.13% of foreign-exchange reserves, excluding gold/);
  const documents = Object.fromEntries(manifest.map(record =>
    [record.path, readFileSync(join(root, 'public', record.path), 'utf8')]));
  const revised = observations.map(record => record.id === gold.id ? { ...record, value: 28 } : record);
  const revisedModel = createContentModel(manifest, documents, revised, timelineEventIds);
  assert.equal(revisedModel.observations[gold.id].value, 28);
  assert.match(JSON.stringify(revisedModel.blocks['10-master-timeline@gold']), /28% of end-2025 official reserves/);
  assert.doesNotMatch(readFileSync(join(root, 'src/App.jsx'), 'utf8'), /estimated gold at 27%/);
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

test('E20 government holdings separate claims, custody, ownership and reserve status', () => {
  const read = num => readFileSync(join(root, 'public/content/bitcoin', manifest.find(record =>
    record.vol === 'bitcoin' && record.num === num).path.split('/').at(-1)), 'utf8');
  const cases = read('04');
  const holders = read('09');
  const timeline = read('14');
  const glossary = read('15');
  assert.match(cases, /civil forfeiture complaint/);
  assert.match(cases, /finally forfeited/);
  assert.match(cases, /transfers do not establish budget proceeds/);
  assert.match(holders, /No reliable cross-country total/);
  assert.match(holders, /civil-recovery proceedings/);
  assert.match(timeline, /civil forfeiture complaint/);
  assert.match(glossary, /order does not publish a reconciled balance/);
  for (const article of [read('03'), cases, read('08'), holders, read('10'), timeline, glossary]) {
    assert.doesNotMatch(article, /governments? (?:hold|held) about 650,000|US holdings ~328,000|holds? 328,000 coins|forfeits 127,271 BTC/);
  }
});

test('E23 petrodollar copy distinguishes invoicing and recycling from redemption', () => {
  const chapter = readFileSync(join(root, 'public/content/after/02-oil-petrodollars-and-stagflation-1973-1982.md'), 'utf8');
  const gold = readFileSync(join(root, 'public/content/gold/08-why-the-dollar-replaced-gold.md'), 'utf8');
  const rules = readFileSync(join(root, 'public/content/after/10-rules-treaties-and-institutions.md'), 'utf8');
  const ledger = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  assert.match(chapter, /invoicing and recycling, not redemption/);
  assert.match(chapter, /dollars \*\*or sterling\*\*/);
  assert.match(chapter, /no fixed quantity of oil claimable/);
  assert.match(gold, /already widely used to quote oil before/);
  assert.match(rules, /Not a dollar-for-oil redemption/);
  assert.match(ledger, /E23.*ID-79-7/);
  for (const article of [chapter, gold, rules]) {
    assert.doesNotMatch(article, /demand base had shifted from gold convertibility to energy convertibility|every country needed dollars to buy energy|agreed that Saudi oil would be priced and sold in dollars/);
  }
});

test('E25 payment comparisons keep authorization, messaging and settlement distinct', () => {
  const after = readFileSync(join(root, 'public/content/after/08-innovation-cards-bitcoin-stablecoins-cbdcs.md'), 'utf8');
  const origin = readFileSync(join(root, 'public/content/bitcoin/01-the-origin-what-2008-produced.md'), 'utf8');
  const design = readFileSync(join(root, 'public/content/bitcoin/02-what-bitcoin-solved-and-what-it-did-not.md'), 'utf8');
  const scale = readFileSync(join(root, 'public/content/bitcoin/11-defects-that-stop-bitcoin-from-being-a-global-currency.md'), 'utf8');
  const ledger = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  assert.match(after, /Swift instruction is \*\*not\*\* a transfer of funds or final settlement/);
  assert.match(after, /Neither gross nor adjusted volume is automatically equivalent/);
  assert.match(origin, /gross blockchain transfer total is \*\*not\*\* a count or value of purchases/);
  assert.match(design, /settlement\*\* stage of other systems, not a card authorization screen/);
  assert.match(design, /total sender cost, recipient amount, elapsed time to usable funds/);
  assert.match(scale, /public channel capacity does not measure completed payments/);
  assert.match(ledger, /E25.*Visa Onchain Analytics/);
  for (const article of [after, origin, design, scale]) {
    assert.doesNotMatch(article, /settling more volume than Visa|processing more transaction volume than Visa|against Visa's average of (?:roughly |about )?10,000/);
  }
});

test('E27 bank capital, funding and reserve eligibility stay distinct', () => {
  const gold = readFileSync(join(root, 'public/content/gold/09-gold-today-what-still-holds-its-value.md'), 'utf8');
  const goldTimeline = readFileSync(join(root, 'public/content/gold/10-master-timeline.md'), 'utf8');
  const crisis = readFileSync(join(root, 'public/content/after/07-financial-crisis-and-the-age-of-qe-2007-2019.md'), 'utf8');
  const rules = readFileSync(join(root, 'public/content/after/10-rules-treaties-and-institutions.md'), 'utf8');
  const comparison = readFileSync(join(root, 'public/content/bitcoin/08-why-not-gold-again.md'), 'utf8');
  const ledger = readFileSync(join(root, 'EDITORIAL-SOURCES.md'), 'utf8');
  assert.match(gold, /to the extent backed by gold-bullion liabilities/);
  assert.match(gold, /85% required-stable-funding factor/);
  assert.match(comparison, /not central-bank reserve eligibility/);
  assert.match(comparison, /1% of a bank's Tier 1 capital and must not exceed 2%/);
  assert.match(ledger, /E27.*CRE20\.110/);
  for (const article of [gold, goldTimeline, crisis, rules, comparison]) {
    assert.doesNotMatch(article, /treated allocated physical gold as a zero-risk asset|gold is reserve-grade|physical gold 0% risk weight|unallocated gold penalized/);
  }
});

test('unverified historical-arc charts are absent rather than CSS-hidden', () => {
  const app = readFileSync(join(root, 'src/App.jsx'), 'utf8');
  const css = readFileSync(join(root, 'src/styles.css'), 'utf8');
  const audit = readFileSync(join(root, 'CHART-AUDIT.md'), 'utf8');
  assert.match(app, /quantitative charts are withheld/);
  assert.doesNotMatch(app, /arcCharts\(|lineChart\(|barChart\(|<figure|chartDenarius|chartGoldStd/);
  assert.doesNotMatch(css, /\.history-arc figure\s*\{\s*display\s*:\s*none/);
  for (const candidate of ['Three-metal ladder', 'Denarius silver content', 'Gold:silver ratio', 'Countries on gold standard', 'Bretton Woods gold and dollar claims', 'US CPI inflation', 'Fiat-era crises', 'US gross federal debt', 'Reserve composition', 'Central-bank gold buying', 'Gold price']) {
    assert.ok(audit.includes(`| ${candidate} |`), `Missing audit row: ${candidate}`);
  }
});

test('connected timeline orders BCE, interwar, fiat and Bitcoin events', () => {
  const dates = ['3 Jan 2009', '15 Aug 1971', 'c. 4600–4300 BCE', '1925', '31 Oct 2008'];
  assert.deepEqual(dates.sort((a, b) => eventSortValue(a) - eventSortValue(b)),
    ['c. 4600–4300 BCE', '1925', '15 Aug 1971', '31 Oct 2008', '3 Jan 2009']);
  assert.equal(eventYear('c. 6th c. BCE'), -550);
  assert.ok(eventSortValue('15 Sep 2008') < eventSortValue('Late 2008'));
  assert.ok(eventSortValue('Late 2008') < eventSortValue('Nov 2008'));
});

test('only reviewed duplicate monetary events combine their volume references', () => {
  const rows = [
    { id: 'evt-gold-0071', vol: 'gold', year: 1971, sort: 1971.6, eventText: 'Gold window closes', refs: [{ href: '#/gold' }] },
    { id: 'evt-after-0002', vol: 'after', year: 1971, sort: 1971.6, eventText: 'Dollar convertibility suspended', refs: [{ href: '#/after' }] },
    { id: 'evt-bitcoin-0003', vol: 'bitcoin', year: 2009, sort: 2009.1, eventText: 'Genesis block mined', refs: [] }
  ];
  const result = mergeSharedEvents(rows);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0].sources, ['gold', 'after']);
  assert.deepEqual(result[0].refs.map(r => r.href), ['#/gold', '#/after']);
  assert.equal(sharedEventId('evt-after-0051'), null);
  assert.equal(sharedEventId('evt-after-0009'), sharedEventId('evt-gold-0073'));
  assert.equal(mergeSharedEvents(rows.slice(1))[0].id, 'evt-after-0002', 'filtered views keep a present source ID');
  assert.equal(SHARED_EVENT_PAIRS.length, 5);
  for (const [first, second] of SHARED_EVENT_PAIRS) {
    assert.ok(timelineEventIds.some(record => record.id === first), first);
    assert.ok(timelineEventIds.some(record => record.id === second), second);
    assert.equal(sharedEventId(first), sharedEventId(second));
  }
  const sameWords = mergeSharedEvents([
    { id: 'evt-gold-0071', vol: 'gold', sort: 1971, eventText: 'Gold window closes', refs: [] },
    { id: 'evt-after-0051', vol: 'after', sort: 1971, eventText: 'Gold window closes', refs: [] }
  ]);
  assert.equal(sameWords.length, 2, 'matching copy does not create an unreviewed duplicate');
});
