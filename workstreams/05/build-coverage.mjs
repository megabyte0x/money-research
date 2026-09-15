import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMd, stripInline } from '../../src/md.js';
import { eventDateRange } from '../../src/timeline.js';
import { TIMELINE_SECTION_REFS, timelineReferenceKey } from '../../src/timeline-references.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const registry = JSON.parse(readFileSync(join(root, 'public/content/timeline-event-ids.json'), 'utf8'));
const reviews = JSON.parse(readFileSync(join(root, 'workstreams/05/reviews.json'), 'utf8'));
const byKey = new Map(registry.map(record => [record.key, record.id]));
const rows = [];
for (const vol of ['gold', 'after', 'bitcoin']) {
  const source = manifest.find(record => record.vol === vol && record.slug.includes('timeline'));
  const text = readFileSync(join(root, 'public', source.path), 'utf8');
  const tables = parseMd(text).filter(block => block.type === 'table');
  for (const row of tables.flatMap(table => table.rows)) {
    const date = stripInline(row[0]);
    const event = stripInline(row[1]);
    const id = byKey.get(timelineReferenceKey(vol, date, event));
    if (!id) throw new Error(`Missing ID: ${vol}|${date}|${event}`);
    const target = TIMELINE_SECTION_REFS[id];
    const destination = target ? `${target[0]}-${target[1]}#${target[2]}` : `${vol}-${source.num}`;
    const links = [...row[1].matchAll(/\[[^\]]+\]\((https?:[^)]+)\)/g)].map(match => match[1]);
    const review = reviews[id];
    rows.push({
      id, volume: vol, displayDate: date, ...eventDateRange(date), event,
      compositeStatus: /;|\. [A-Z]|\b and \b/i.test(event) ? 'suspected—requires split/relationship review' : 'not flagged by syntax; still needs review',
      destination, destinationStatus: review ? review.destinationStatus : target ? 'existing mapping; recheck after chapter edits' : 'unreviewed source-timeline fallback',
      relevanceRationale: review ? review.relevanceRationale : target ? 'Prior mapping exists; event-specific relevance has not been rechecked in this package.'
        : 'No event-specific chapter relationship reviewed yet.',
      evidence: review ? review.evidence : links.length ? links : ['source timeline row only; independent corroboration pending'],
      accuracyDisposition: review ? review.accuracyDisposition : 'independent chronology/source review pending',
      disposition: review ? review.disposition : 'pending editorial chronology and relevance review'
    });
  }
}
if (rows.length !== registry.length) throw new Error(`Row/registry mismatch: ${rows.length}/${registry.length}`);
writeFileSync(join(root, 'workstreams/05/coverage.json'), JSON.stringify(rows, null, 2) + '\n');
const publicReviewStatus = Object.fromEntries(rows.map(row => [row.id,
  row.disposition.startsWith('reviewed')
    ? row.destinationStatus === 'reviewed source-timeline fallback'
      ? 'source_timeline_fallback_reviewed' : 'chapter_destination_checked'
    : 'destination_review_pending']));
writeFileSync(join(root, 'public/content/timeline-review-status.json'),
  JSON.stringify(publicReviewStatus, null, 2) + '\n');
const counts = Object.fromEntries(['gold', 'after', 'bitcoin'].map(vol => {
  const subset = rows.filter(row => row.volume === vol);
  return [vol, { rows: subset.length, mapped: subset.filter(row => !row.destinationStatus.startsWith('unreviewed')).length,
    reviewedHere: subset.filter(row => row.disposition.startsWith('reviewed')).length,
    suspectedComposites: subset.filter(row => row.compositeStatus.startsWith('suspected')).length }];
}));
console.log(JSON.stringify(counts));
