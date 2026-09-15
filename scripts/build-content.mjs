import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContentModel } from '../src/content-model.js';
import { indexObservations, resolveObservations } from '../src/observations.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = join(root, 'public/content');
const manifest = JSON.parse(readFileSync(join(content, 'manifest.json'), 'utf8'));
const observations = JSON.parse(readFileSync(join(content, 'observations.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(content, 'sources.json'), 'utf8'));
const claims = JSON.parse(readFileSync(join(content, 'claims.json'), 'utf8'));
const articleMetadata = JSON.parse(readFileSync(join(content, 'article-metadata.json'), 'utf8'));
const timelineEventIds = JSON.parse(readFileSync(join(content, 'timeline-event-ids.json'), 'utf8'));
const timelineReviewStatus = JSON.parse(readFileSync(join(content, 'timeline-review-status.json'), 'utf8'));
const comparisonCells = JSON.parse(readFileSync(join(content, 'comparison-cells.json'), 'utf8'));
const documents = Object.fromEntries(manifest.map(record =>
  [record.path, readFileSync(join(root, 'public', record.path), 'utf8')]));
const model = createContentModel(manifest, documents, observations, timelineEventIds, { sources, claims }, articleMetadata, timelineReviewStatus, comparisonCells);
const byObservationId = indexObservations(observations);
for (const record of manifest) {
  const output = join(content, 'resolved', record.path.slice('content/'.length));
  mkdirSync(join(content, 'resolved', record.vol), { recursive: true });
  writeFileSync(output, resolveObservations(documents[record.path], byObservationId));
}
writeFileSync(join(content, 'index.json'), JSON.stringify(model));
console.log(`Indexed ${manifest.length} articles and ${model.glossary.length} glossary terms`);
