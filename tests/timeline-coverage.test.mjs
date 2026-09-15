import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMd, stripInline } from '../src/md.js';
import { eventDateRange, eventSortValue, eventYear, mergeSharedEvents, SHARED_EVENT_PAIRS } from '../src/timeline.js';
import { TIMELINE_SECTION_REFS, timelineReferenceKey } from '../src/timeline-references.js';

const root = new URL('../', import.meta.url).pathname;
const registry = JSON.parse(readFileSync(join(root, 'public/content/timeline-event-ids.json'), 'utf8'));
const coverage = JSON.parse(readFileSync(join(root, 'workstreams/05/coverage.json'), 'utf8'));
const publicReviewStatus = JSON.parse(readFileSync(join(root, 'public/content/timeline-review-status.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

test('coverage lists each current stable event ID exactly once', () => {
  assert.equal(coverage.length, registry.length);
  assert.deepEqual(new Set(coverage.map(row => row.id)), new Set(registry.map(row => row.id)));
  const keys = new Set(registry.map(row => row.key));
  for (const row of coverage) {
    assert.ok(keys.has(timelineReferenceKey(row.volume, row.displayDate, row.event)));
    assert.ok(row.disposition && row.destinationStatus && row.relevanceRationale);
    const target = TIMELINE_SECTION_REFS[row.id];
    if (target) {
      assert.equal(row.destination, `${target[0]}-${target[1]}#${target[2]}`);
      const article = manifest.find(record => record.vol === target[0] && record.num === target[1]);
      assert.ok(article, `${row.id}: target article`);
      const sections = parseMd(readFileSync(join(root, 'public', article.path), 'utf8'));
      assert.ok(sections.some(block => block.type === 'h2' && block.id === target[2]), `${row.id}: target section`);
    }
    else assert.match(row.destinationStatus, /(?:unreviewed|reviewed) source-timeline fallback/);
  }
});

test('public review status distinguishes checked chapter, checked fallback and pending IDs', () => {
  assert.deepEqual(new Set(Object.keys(publicReviewStatus)), new Set(registry.map(row => row.id)));
  for (const row of coverage) {
    const expected = row.disposition.startsWith('reviewed')
      ? row.destinationStatus === 'reviewed source-timeline fallback'
        ? 'source_timeline_fallback_reviewed' : 'chapter_destination_checked'
      : 'destination_review_pending';
    assert.equal(publicReviewStatus[row.id], expected, row.id);
  }
  assert.equal(publicReviewStatus['evt-gold-0080'], 'source_timeline_fallback_reviewed');
  assert.equal(publicReviewStatus['evt-after-0039'], 'chapter_destination_checked');
  assert.equal(Object.values(publicReviewStatus).filter(status => status === 'destination_review_pending').length, 0);
});

test('explicit historical ranges preserve BCE order and no-year-zero convention', () => {
  assert.deepEqual(eventDateRange('c. 4600–4300 BCE').start, -4600);
  assert.deepEqual(eventDateRange('c. 6th c. BCE'),
    { start: -600, end: -501, precision: 'century', approximate: true });
  assert.deepEqual(eventDateRange('5th–11th c.'),
    { start: 401, end: 1100, precision: 'century', approximate: true });
  assert.equal(eventDateRange('1040s–1090s').start, 1040);
  assert.equal(eventDateRange('1040s–1090s').end, 1099);
  assert.equal(eventYear('1040s–1090s'), 1040);
  assert.equal(eventDateRange('2026 Q1').precision, 'quarter');
  assert.equal(eventDateRange('~Apr 2028').approximate, true);
  assert.ok(eventSortValue('c. 6th c. BCE') < eventSortValue('407 BCE'));
  assert.ok(eventSortValue('Feb 1973') < eventSortValue('Mar 1973'));
});

test('difficulty correction and halving relationship match checked destination bodies', () => {
  const difficulty = coverage.find(row => row.id === 'evt-bitcoin-0098');
  const halving = coverage.find(row => row.id === 'evt-bitcoin-0101');
  assert.equal(difficulty.displayDate, '5 Sep 2026');
  assert.doesNotMatch(difficulty.event, /950 EH\/s|0\.43%/);
  assert.match(difficulty.event, /block 965,664/);
  assert.match(halving.event, /calendar date/);
  const chainFork = coverage.find(row => row.id === 'evt-bitcoin-0011');
  assert.equal(chainFork.displayDate, '11–12 Mar 2013');
  assert.match(chainFork.destinationStatus, /reviewed source-timeline fallback/);
  assert.doesNotMatch(chainFork.event, /second and last outage/);
  const goldPeak = coverage.find(row => row.id === 'evt-gold-0080');
  assert.equal(goldPeak.displayDate, '5–6 Sep 2011');
  assert.match(goldPeak.event, /LBMA Gold Price PM.*\$1,895/);
  assert.match(goldPeak.destinationStatus, /reviewed source-timeline fallback/);
  assert.equal(TIMELINE_SECTION_REFS[difficulty.id][2], 'what-the-design-actually-is');
  assert.equal(TIMELINE_SECTION_REFS[halving.id][2], 'the-supply-september-2026');
  for (const [row, expected] of [[difficulty, /5 September 2026.*127\.45|127\.45.*5 September 2026/s],
    [halving, /1,050,000/]]) {
    const [vol, num, section] = TIMELINE_SECTION_REFS[row.id];
    const article = manifest.find(record => record.vol === vol && record.num === num);
    const blocks = parseMd(readFileSync(join(root, 'public', article.path), 'utf8'));
    const start = blocks.findIndex(block => block.type === 'h2' && block.id === section);
    assert.ok(start >= 0);
    const end = blocks.findIndex((block, index) => index > start && block.type === 'h2');
    const body = JSON.stringify(blocks.slice(start + 1, end < 0 ? undefined : end));
    assert.match(body, expected);
  }
});

test('three checked After Gold/Bitcoin overlaps keep both source lanes and distinct references', () => {
  const pairs = [
    ['evt-after-0071', 'evt-bitcoin-0001'],
    ['evt-after-0072', 'evt-bitcoin-0002'],
    ['evt-after-0073', 'evt-bitcoin-0003']
  ];
  for (const pair of pairs) assert.ok(SHARED_EVENT_PAIRS.some(candidate =>
    candidate[0] === pair[0] && candidate[1] === pair[1]));
  const merged = mergeSharedEvents([
    { id: 'evt-after-0072', vol: 'after', sort: 2008, eventText: 'Bitcoin whitepaper published', refs: [{ href: '#/after' }] },
    { id: 'evt-bitcoin-0002', vol: 'bitcoin', sort: 2008, eventText: 'Satoshi posts the whitepaper', refs: [{ href: '#/bitcoin' }] }
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].eventText, 'Bitcoin whitepaper published');
  assert.deepEqual(merged[0].sources, ['after', 'bitcoin']);
  assert.deepEqual(merged[0].refs.map(ref => ref.href), ['#/after', '#/bitcoin']);
});

test('Nasdaq and Intel 4004 retain separate dates, IDs and sourced fallbacks', () => {
  const nasdaq = coverage.find(row => row.id === 'evt-after-0001');
  const intel = coverage.find(row => row.id === 'evt-after-0121');
  assert.equal(nasdaq.displayDate, '8 Feb 1971');
  assert.equal(intel.displayDate, '15 Nov 1971');
  assert.match(nasdaq.event, /Nasdaq/);
  assert.doesNotMatch(nasdaq.event, /Intel/);
  assert.match(intel.event, /Intel/);
  assert.doesNotMatch(intel.event, /Nasdaq/);
  assert.match(nasdaq.destinationStatus, /reviewed source-timeline fallback/);
  assert.match(intel.destinationStatus, /reviewed source-timeline fallback/);
});

test('the European snake and CME futures launch are separately dated and relevant', () => {
  const snake = coverage.find(row => row.id === 'evt-after-0005');
  const futures = coverage.find(row => row.id === 'evt-after-0122');
  assert.equal(snake.displayDate, '24 Apr 1972');
  assert.equal(futures.displayDate, '16 May 1972');
  assert.match(snake.event, /snake/);
  assert.doesNotMatch(snake.event, /CME/);
  assert.match(futures.event, /CME/);
  assert.doesNotMatch(futures.event, /snake/);
  assert.equal(TIMELINE_SECTION_REFS[snake.id][2], 'europe-tries-to-keep-fixed-rates-among-itself');
  assert.equal(TIMELINE_SECTION_REFS[futures.id][2], 'what-floating-did-to-the-world-economy');
});

test('Cboe, Black–Scholes and Swift have separate primary-sourced dates', () => {
  const cboe = coverage.find(row => row.id === 'evt-after-0007');
  const paper = coverage.find(row => row.id === 'evt-after-0123');
  const swift = coverage.find(row => row.id === 'evt-after-0124');
  assert.deepEqual([cboe.displayDate, paper.displayDate, swift.displayDate],
    ['26 Apr 1973', '1 May 1973', '3 May 1973']);
  assert.match(cboe.event, /Chicago Board Options Exchange/);
  assert.match(paper.event, /Fischer Black and Myron Scholes/);
  assert.match(swift.event, /SWIFT.*1977/);
  assert.equal(TIMELINE_SECTION_REFS[cboe.id][2], 'managing-the-new-risks-derivatives-1972-2000');
  assert.equal(TIMELINE_SECTION_REFS[paper.id][2], 'managing-the-new-risks-derivatives-1972-2000');
  assert.equal(TIMELINE_SECTION_REFS[swift.id][2], 'moving-money-from-swift-to-real-time-payments-1973-2023');
});

test('Basel Committee and U.S. gold ownership are separate, with gold event shared', () => {
  const basel = coverage.find(row => row.id === 'evt-after-0011');
  const goldAfter = coverage.find(row => row.id === 'evt-after-0125');
  const goldFirst = coverage.find(row => row.id === 'evt-gold-0074');
  assert.equal(basel.displayDate, 'Dec 1974');
  assert.equal(goldAfter.displayDate, '31 Dec 1974');
  assert.doesNotMatch(basel.event, /private gold/);
  assert.doesNotMatch(goldAfter.event, /Basel/);
  assert.equal(goldFirst.displayDate, goldAfter.displayDate);
  assert.ok(SHARED_EVENT_PAIRS.some(pair => pair[0] === goldFirst.id && pair[1] === goldAfter.id));
  const merged = mergeSharedEvents([
    { id: goldFirst.id, vol: 'gold', sort: 1974.9, eventText: goldFirst.event, refs: [{ href: '#/gold' }] },
    { id: goldAfter.id, vol: 'after', sort: 1974.9, eventText: goldAfter.event, refs: [{ href: '#/after' }] }
  ]);
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].sources, ['gold', 'after']);
  assert.deepEqual(merged[0].refs.map(ref => ref.href), ['#/gold', '#/after']);
});

test('UK IMF approval, draw and negotiation stay separate from Visa branding and 1975 statehood', () => {
  const byId = id => coverage.find(row => row.id === id);
  assert.deepEqual(
    ['evt-after-0135', 'evt-after-0015', 'evt-after-0137', 'evt-after-0138'].map(id => byId(id).displayDate),
    ['31 Dec 1975', 'May 1976', '15 Dec 1976', '3 Jan 1977']
  );
  assert.match(byId('evt-after-0135').event, /approves.*700 million/);
  assert.match(byId('evt-after-0015').event, /draws.*700 million/);
  assert.match(byId('evt-after-0137').event, /letter of intent/);
  assert.match(byId('evt-after-0138').event, /approves.*3\.36 billion/);
  assert.doesNotMatch(byId('evt-after-0015').event, /Visa|only G7/);
  assert.equal(byId('evt-after-0136').displayDate, '1976');
  assert.deepEqual(
    ['evt-after-0132', 'evt-after-0133', 'evt-after-0134'].map(id => byId(id).displayDate),
    ['25 Jun 1975', '11 Nov 1975', '25 Nov 1975']
  );
  assert.equal(byId('evt-after-0012').destinationStatus, 'destination body checked');
});

test('1980 and 1986 economic events do not absorb independent wars, treaties or statehood', () => {
  const byId = id => coverage.find(row => row.id === id);
  assert.deepEqual(
    ['evt-after-0139', 'evt-after-0022', 'evt-after-0140'].map(id => byId(id).displayDate),
    ['31 Mar 1980', '18 Apr 1980', 'Sep 1980']
  );
  assert.match(byId('evt-after-0139').event, /Depository Institutions Deregulation/);
  assert.match(byId('evt-after-0022').event, /Zimbabwe/);
  assert.match(byId('evt-after-0140').event, /Iran and Iraq/);
  assert.deepEqual(
    ['evt-after-0142', 'evt-after-0028', 'evt-after-0141'].map(id => byId(id).displayDate),
    ['Feb 1986', 'Jul 1986', '27 Oct 1986']
  );
  assert.match(byId('evt-after-0028').event, /first-purchase.*\$9\.25/);
  assert.doesNotMatch(byId('evt-after-0028').event, /Big Bang|Single European Act|world spot/);
});

test('1989 debt, euro and central-bank milestones retain separate effective dates', () => {
  const byId = id => coverage.find(row => row.id === id);
  assert.deepEqual(
    ['evt-after-0032', 'evt-after-0143', 'evt-after-0144'].map(id => byId(id).displayDate),
    ['Mar 1989', 'Apr 1989', '1989']
  );
  assert.match(byId('evt-after-0032').event, /Brady.*announce|Brady.*announces/);
  assert.match(byId('evt-after-0143').event, /Delors Committee/);
  assert.match(byId('evt-after-0144').event, /John Williamson/);
  assert.deepEqual(
    ['evt-after-0033', 'evt-after-0145', 'evt-after-0146'].map(id => byId(id).displayDate),
    ['9 Nov 1989', '20 Dec 1989', '2 Mar 1990']
  );
  assert.match(byId('evt-after-0145').event, /commences on 1 February 1990/);
  assert.match(byId('evt-after-0146').event, /Policy Targets Agreement/);
  assert.doesNotMatch(byId('evt-after-0033').event, /inflation targeting/);
});

test('1990 Namibian independence, German monetary union and political reunification keep separate dates and conversion categories', () => {
  const byId = id => coverage.find(row => row.id === id);
  assert.deepEqual(
    ['evt-after-0147', 'evt-after-0036', 'evt-after-0148'].map(id => byId(id).displayDate),
    ['21 Mar 1990', '1 Jul 1990', '3 Oct 1990']
  );
  assert.match(byId('evt-after-0036').event, /recurring wages, pensions and rents convert 1:1/i);
  assert.match(byId('evt-after-0036').event, /age-based caps, then 2:1/i);
  assert.doesNotMatch(byId('evt-after-0036').event, /prices convert 1:1/i);
  assert.equal(publicReviewStatus['evt-after-0147'], 'source_timeline_fallback_reviewed');
  assert.equal(byId('evt-after-0038').displayDate, '1 Apr 1991');
  assert.match(byId('evt-after-0038').event, /10,000 australes per U\.S\. dollar/);
  assert.match(byId('evt-after-0038').event, /peso does not replace the austral until 1 January 1992/);
});
