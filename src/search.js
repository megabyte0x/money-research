import { slugify, stripInline } from './md.js';

const VOLUMES = new Set(['gold', 'after', 'bitcoin']);

export function searchState(hash) {
  const params = new URLSearchParams((hash.split('?')[1] || ''));
  const vol = params.get('vol') || '';
  return { query: params.get('q') || '', volume: VOLUMES.has(vol) ? vol : '' };
}

export function searchUrl(query, volume = '') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (VOLUMES.has(volume)) params.set('vol', volume);
  return '/#/search' + (params.size ? '?' + params.toString() : '');
}

// Expand only exact, reviewed vocabulary. Substring expansion (for example
// treating every occurrence of "pow" as proof of work) produces false hits.
const ALIAS_GROUPS = [
  ['quantitative easing', 'qe'],
  ['central bank digital currency', 'cbdc'],
  ['unspent transaction output', 'utxo'],
  ['proof of work', 'pow'],
  ['bitcoin improvement proposal', 'bip'],
  ['federal reserve', 'the fed'],
];

export function searchPhrases(query) {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return ALIAS_GROUPS.find(group => group.includes(q)) || [q];
}

function firstMatch(text, terms) {
  const lower = text.toLowerCase();
  let best = null;
  for (const term of terms) {
    let from = 0, at;
    while ((at = lower.indexOf(term, from)) >= 0) {
      if (term.length > 3 || (!/[a-z]/.test(lower[at - 1] || '') && !/[a-z]/.test(lower[at + term.length] || ''))) {
        if (!best || at < best.index) best = { index: at, length: term.length };
        break;
      }
      from = at + 1;
    }
  }
  return best;
}

function blockText(block) {
  if (block.type === 'p' || block.type === 'quote') return stripInline(block.text);
  if (block.type === 'table') return block.rows.map(row => row.join(' — ')).join('\n');
  if (block.type === 'ul' || block.type === 'ol') return block.items.map(stripInline).join('\n');
  return '';
}

// One result per article section; retain the strongest passage and the count of
// other matching passages. Nothing here depends on React or browser state.
export function searchDocuments(manifest, blocks, query, volume = '') {
  const q = query.trim();
  if (q.length < 2) return [];
  const terms = searchPhrases(q);
  const results = [];
  const seenGlossaryTerms = new Set();
  for (const article of manifest) {
    if (volume && article.vol !== volume) continue;
    const sections = new Map();
    let section = '', sectionTitle = '', sectionFirst = false;
    for (const block of blocks[article.slug + '@' + article.vol] || []) {
      if (block.type === 'h2') { section = block.id; sectionTitle = stripInline(block.text); sectionFirst = true; }
      const text = blockText(block);
      const firstInSection = !!text && sectionFirst;
      if (text) sectionFirst = false;
      const hit = firstMatch(text, terms);
      const headingHit = firstInSection && firstMatch(sectionTitle, terms);
      if (!hit && !headingHit) continue;
      const line = block.type === 'table' && hit ? text.split('\n').find(l => firstMatch(l, terms)) : text;
      const position = hit ? firstMatch(line, terms) : null;
      const start = position ? Math.max(0, position.index - 110) : 0;
      const end = Math.min(line.length, position ? position.index + position.length + 160 : 270);
      const reference = /readme|timeline|sources/.test(article.slug);
      const glossary = article.slug.includes('glossary');
      const glossaryTerm = glossary && block.type === 'p' ? block.text.match(/^\*\*(.+?)\*\*\s*[—–-]/)?.[1] : null;
      const glossaryId = glossaryTerm ? slugify(glossaryTerm) : '';
      if (glossaryId) {
        if (seenGlossaryTerms.has(glossaryId)) continue;
        seenGlossaryTerms.add(glossaryId);
      }
      const definition = glossaryTerm && firstMatch(glossaryTerm, terms);
      const score = (reference && !glossary ? -12 : 0) + (glossary ? 10 : 0) +
        (definition ? 18 : 0) + (firstMatch(sectionTitle, terms) ? 8 : 0) +
        (firstInSection && headingHit ? 12 : 0) +
        (firstMatch(article.title, terms) ? 5 : 0) + (position?.index === 0 ? 3 : 0);
      const key = glossaryId || section || '_intro';
      const candidate = { article, section, sectionTitle, glossaryTerm, glossaryId, score, matches: 1,
        snippet: position ? { before: (start ? '…' : '') + line.slice(start, position.index),
          match: line.slice(position.index, position.index + position.length),
          after: line.slice(position.index + position.length, end) + (end < line.length ? '…' : '') } :
          { before: line.slice(0, end) + (end < line.length ? '…' : ''), match: '', after: '' } };
      const prior = sections.get(key);
      if (prior) {
        candidate.matches += prior.matches;
        if (prior.score > score) { prior.matches++; continue; }
      }
      sections.set(key, candidate);
    }
    results.push(...[...sections.values()].sort((a, b) => b.score - a.score).slice(0, 3));
  }
  return results.sort((a, b) => b.score - a.score || a.article.id.localeCompare(b.article.id)).slice(0, 80);
}
