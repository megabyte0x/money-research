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
writeFileSync(join(content, 'shell.json'), JSON.stringify({
  manifest: model.manifest,
  fileRefs: model.fileRefs,
  glossary: model.glossary,
  articleMetadata: model.articleMetadata,
  articleEvidence: model.articleEvidence,
  articleClaims: model.articleClaims,
  sources: model.sources || {},
  claims: model.claims || {},
}));
mkdirSync(join(content, 'articles'), { recursive: true });
for (const record of manifest) {
  writeFileSync(join(content, 'articles', `${record.id}.json`), JSON.stringify({
    id: record.id,
    blocks: model.blocks[`${record.slug}@${record.vol}`],
  }));
}
writeFileSync(join(content, 'search-index.json'), JSON.stringify({ blocks: model.blocks }));
writeFileSync(join(content, 'discovery.json'), JSON.stringify({
  timelineReviewStatus: model.timelineReviewStatus,
  comparisonCells: model.comparisonCells,
  observations: model.observations,
}));
console.log(`Indexed ${manifest.length} articles and ${model.glossary.length} glossary terms`);
