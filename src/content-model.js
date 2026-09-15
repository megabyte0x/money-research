import { parseGlossary, parseMd, stripInline } from './md.js';
import { indexObservations, resolveObservations } from './observations.js';
import { indexTimelineEventIds, timelineReferenceKey, TIMELINE_SECTION_REFS } from './timeline-references.js';
import { createEvidenceIndex } from './evidence.js';
import { indexArticleMetadata } from './article-metadata.js';
import { canonicalGlossary } from './features/discovery/canonical.js';
import { indexComparisonCells } from './comparison-cells.js';

export function createContentModel(manifest, documents, observations, timelineEventIds, evidence = null, articleMetadata = [], timelineReviewStatus = null, comparisonCellRecords = []) {
  if (!Array.isArray(manifest) || !documents || typeof documents !== 'object') {
    throw new Error('Invalid content inputs');
  }
  const byObservationId = indexObservations(observations);
  const byTimelineEventKey = indexTimelineEventIds(timelineEventIds);
  const seenTimelineIds = new Set();
  const ids = new Set();
  const routes = new Set();
  const blocks = {};
  const fileRefs = {};
  const observationRefs = {};
  let glossary = [];

  for (const record of manifest) {
    const key = `${record.slug}@${record.vol}`;
    if (!/^(gold|after|bitcoin|zcash)-\d{2}$/.test(record.id) ||
        !/^content\/(gold|after|bitcoin|zcash)\/[a-z0-9-]+\.md$/.test(record.path) ||
        record.path.split('/')[1] !== record.vol || ids.has(record.id) || routes.has(key)) {
      throw new Error(`Invalid or duplicate article: ${record.id}`);
    }
    ids.add(record.id);
    routes.add(key);
    const source = documents[record.path];
    if (typeof source !== 'string') throw new Error(`Missing article: ${record.path}`);
    observationRefs[record.id] = [...new Set([...source.matchAll(/\{\{obs:([a-z0-9-]+)\}\}/g)].map(match => match[1]))];
    if (source.trim().split(/\s+/).length !== record.words) throw new Error(`Stale word count: ${record.id}`);
    const content = resolveObservations(source, byObservationId);
    const parsed = parseMd(content);
    if (record.slug.includes('timeline')) {
      const datedTable = block => block.type === 'table' && /^date$/i.test(stripInline(block.header?.[0] || ''));
      const sourceTables = parseMd(source).filter(datedTable);
      const renderedTables = parsed.filter(datedTable);
      if (sourceTables.length !== renderedTables.length) throw new Error(`Timeline table mismatch: ${record.id}`);
      sourceTables.forEach((table, tableIndex) => {
        const rendered = renderedTables[tableIndex];
        if (table.rows.length !== rendered.rows.length) throw new Error(`Timeline row mismatch: ${record.id}`);
        rendered.eventIds = table.rows.map(row => {
          const key = timelineReferenceKey(record.vol, stripInline(row[0] || ''), stripInline(row[1] || ''));
          const id = byTimelineEventKey.get(key);
          if (!id || seenTimelineIds.has(id)) throw new Error(`Missing or duplicate timeline event ID: ${key}`);
          seenTimelineIds.add(id);
          return id;
        });
      });
    }
    const headings = parsed.filter(block => block.type === 'h2').map(block => block.text);
    if (JSON.stringify(headings) !== JSON.stringify(record.h2)) throw new Error(`Stale headings: ${record.id}`);
    const headingIds = new Set(parsed.filter(block => /^h[1-4]$/.test(block.type)).map(block => block.id));
    for (const [oldId, newId] of Object.entries(record.sectionAliases || {})) {
      if (!/^[a-z0-9-]+$/.test(oldId) || headingIds.has(oldId) || !headingIds.has(newId)) {
        throw new Error(`Invalid section alias: ${record.id} ${oldId} → ${newId}`);
      }
    }
    blocks[key] = parsed;
    fileRefs[key] = [...new Set([...content.matchAll(/\bfiles?\s+(\d{2}(?:(?:,|\s+and)\s+\d{2})*)/gi)]
      .flatMap(match => match[1].match(/\d{2}/g)))];
    if (record.slug.includes('glossary')) {
      glossary = glossary.concat(parseGlossary(content).map(term => ({ ...term, vol: record.vol })));
    }
  }

  if (seenTimelineIds.size !== byTimelineEventKey.size) throw new Error('Unreferenced timeline event ID');

  if (timelineReviewStatus !== null) {
    if (!timelineReviewStatus || Array.isArray(timelineReviewStatus) || typeof timelineReviewStatus !== 'object' ||
        Object.keys(timelineReviewStatus).length !== seenTimelineIds.size) {
      throw new Error('Timeline review status inventory mismatch');
    }
    const allowed = new Set(['chapter_destination_checked', 'source_timeline_fallback_reviewed', 'destination_review_pending']);
    for (const [id, status] of Object.entries(timelineReviewStatus)) {
      if (!seenTimelineIds.has(id) || !allowed.has(status)) throw new Error(`Invalid timeline review status: ${id}`);
      const ref = TIMELINE_SECTION_REFS[id];
      if ((status === 'chapter_destination_checked') !== !!ref) throw new Error(`Timeline review/link mismatch: ${id}`);
      if (ref) {
        const article = manifest.find(record => record.vol === ref[0] && record.num === ref[1]);
        if (!article || !(blocks[`${article.slug}@${article.vol}`] || []).some(block => block.id === ref[2])) {
          throw new Error(`Timeline chapter section unavailable: ${id}`);
        }
      }
    }
  }

  const evidenceIndex = evidence ? createEvidenceIndex(evidence.sources, evidence.claims, observations, ids) : {};
  const comparisonCells = indexComparisonCells(comparisonCellRecords, evidenceIndex.claims || {}, evidenceIndex.sources || {});
  const publishedMetadata = resolveAnswerCitations(
    indexArticleMetadata(articleMetadata, manifest, blocks),
    evidenceIndex,
  );
  const articleEvidence = evidence ? Object.fromEntries(manifest.map(record => [record.id,
    observationRefs[record.id].map(id => {
      const observation = byObservationId.get(id);
      const source = evidenceIndex.sources[observation.sourceId];
      return { observationId: id, claimId: observation.claimId, sourceId: observation.sourceId,
        publisher: source.publisher, title: source.title, url: source.url,
        locator: observation.sourceLocator, period: observation.period, uncertainty: observation.uncertainty };
    })])) : {};
  const articleClaims = evidence ? Object.fromEntries(manifest.map(record => [record.id,
    Object.values(evidenceIndex.claims).filter(claim => claim.articleIds.includes(record.id)).map(claim => ({
      id: claim.id, assertion: claim.assertion, scope: claim.scope,
      citations: claim.supporting.map(locator => {
        const source = evidenceIndex.sources[locator.sourceId];
        return { sourceId: locator.sourceId, publisher: source.publisher, title: source.title,
          url: source.url, locator: locator.locator };
      })
    }))])) : {};

  glossary = canonicalGlossary(glossary);
  return { manifest, blocks, fileRefs, glossary, timelineReviewStatus: timelineReviewStatus || {}, comparisonCells, observations: Object.fromEntries(byObservationId), articleEvidence, articleClaims, articleMetadata: publishedMetadata, ...evidenceIndex };
}

function resolveAnswerCitations(publishedMetadata, evidenceIndex) {
  const claims = evidenceIndex.claims || {};
  const sources = evidenceIndex.sources || {};
  return Object.fromEntries(Object.entries(publishedMetadata).map(([id, row]) => {
    const citations = (row.citations || []).flatMap(item => {
      const claim = claims[item.claimId];
      if (!claim) throw new Error(`Unknown answer citation claim: ${id} ${item.claimId}`);
      return claim.supporting.map(locator => {
        const source = sources[locator.sourceId];
        if (!source) throw new Error(`Missing citation source: ${id} ${locator.sourceId}`);
        return {
          claimId: claim.id,
          sourceId: locator.sourceId,
          publisher: source.publisher,
          title: source.title,
          url: source.url,
          locator: locator.locator,
        };
      });
    });
    return [id, { ...row, citations }];
  }));
}
