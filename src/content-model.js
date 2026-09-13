import { parseGlossary, parseMd } from './md.js';
import { indexObservations, resolveObservations } from './observations.js';

export function createContentModel(manifest, documents, observations) {
  if (!Array.isArray(manifest) || !documents || typeof documents !== 'object') {
    throw new Error('Invalid content inputs');
  }
  const byObservationId = indexObservations(observations);
  const ids = new Set();
  const routes = new Set();
  const blocks = {};
  const fileRefs = {};
  let glossary = [];

  for (const record of manifest) {
    const key = `${record.slug}@${record.vol}`;
    if (!/^(gold|after|bitcoin)-\d{2}$/.test(record.id) ||
        !/^content\/(gold|after|bitcoin)\/[a-z0-9-]+\.md$/.test(record.path) ||
        record.path.split('/')[1] !== record.vol || ids.has(record.id) || routes.has(key)) {
      throw new Error(`Invalid or duplicate article: ${record.id}`);
    }
    ids.add(record.id);
    routes.add(key);
    const source = documents[record.path];
    if (typeof source !== 'string') throw new Error(`Missing article: ${record.path}`);
    if (source.trim().split(/\s+/).length !== record.words) throw new Error(`Stale word count: ${record.id}`);
    const content = resolveObservations(source, byObservationId);
    const parsed = parseMd(content);
    const headings = parsed.filter(block => block.type === 'h2').map(block => block.text);
    if (JSON.stringify(headings) !== JSON.stringify(record.h2)) throw new Error(`Stale headings: ${record.id}`);
    blocks[key] = parsed;
    fileRefs[key] = [...new Set([...content.matchAll(/\bfiles?\s+(\d{2}(?:(?:,|\s+and)\s+\d{2})*)/gi)]
      .flatMap(match => match[1].match(/\d{2}/g)))];
    if (record.slug.includes('glossary')) {
      glossary = glossary.concat(parseGlossary(content).map(term => ({ ...term, vol: record.vol })));
    }
  }

  const seen = new Set();
  glossary = glossary.filter(term => {
    const key = term.term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.term.localeCompare(b.term));
  return { manifest, blocks, fileRefs, glossary };
}
