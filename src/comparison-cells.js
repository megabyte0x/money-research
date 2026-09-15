import { isSafeContentHref } from './md.js';

const arrangements = new Set(['physical-gold', 'fiat-cash', 'bank-deposit', 'self-custodied-btc', 'custodial-btc', 'fiat-backed-stablecoin']);
const uses = new Set(['saving', 'payment', 'cross-border', 'pricing']);
const perspectives = new Set(['household', 'merchant', 'central-bank']);

export function indexComparisonCells(records, claims = {}, sources = {}) {
  if (!Array.isArray(records)) throw new Error('Comparison cells must be an array');
  const cells = {};
  for (const cell of records) {
    const parts = cell?.id?.split(':') || [];
    if (parts.length !== 3 || !arrangements.has(parts[0]) || !uses.has(parts[1]) ||
        !perspectives.has(parts[2]) || cells[cell.id]) {
      throw new Error(`Invalid or duplicate comparison cell: ${cell?.id}`);
    }
    const claim = claims[cell.claimId];
    if (claim?.reviewState !== 'accepted' || !claim.views.includes('comparison') ||
        !cell.text?.trim() || !cell.scope?.trim() || !cell.uncertainty?.trim() ||
        !Array.isArray(cell.citations) || !cell.citations.length) {
      throw new Error(`Unaccepted comparison cell: ${cell.id}`);
    }
    for (const citation of cell.citations) {
      const source = sources[citation?.sourceId];
      if (!source || source.url !== citation.href || source.title !== citation.title ||
          !isSafeContentHref(citation.href) || !citation.href.startsWith('https://') ||
          !claim.supporting.some(item => item.sourceId === citation.sourceId && item.locator === citation.locator)) {
        throw new Error(`Unresolved comparison citation: ${cell.id}`);
      }
    }
    cells[cell.id] = cell;
  }
  return cells;
}
