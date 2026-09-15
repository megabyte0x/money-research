export const USES = [
  { id: 'saving', label: 'Saving purchasing power' },
  { id: 'payment', label: 'Everyday payment' },
  { id: 'cross-border', label: 'Cross-border settlement' },
  { id: 'pricing', label: 'Pricing wages and debts' },
];

export const ARRANGEMENTS = [
  { id: 'physical-gold', label: 'Physical gold', research: '/gold/04-what-gives-gold-its-value/' },
  { id: 'fiat-cash', label: 'Fiat cash', research: '/after/01-the-break-1971-1976/' },
  { id: 'bank-deposit', label: 'Bank deposit', research: '/after/07-financial-crisis-and-the-age-of-qe-2007-2019/' },
  { id: 'self-custodied-btc', label: 'Self-custodied BTC', research: '/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/' },
  { id: 'custodial-btc', label: 'Custodial BTC', research: '/bitcoin/09-supply-and-control-who-holds-bitcoin-and-who-benefits/' },
  { id: 'fiat-backed-stablecoin', label: 'USDC · Circle LLC, Ethereum', research: '/after/08-innovation-cards-bitcoin-stablecoins-cbdcs/' },
];

export const PERSPECTIVES = [
  { id: 'household', label: 'Household' },
  { id: 'merchant', label: 'Merchant' },
  { id: 'central-bank', label: 'Central bank' },
];

export function publishableCell(cell, claims = {}, sources = {}) {
  if (!cell || !cell.claimId || !cell.text?.trim() || !cell.scope?.trim() ||
      !cell.uncertainty?.trim() || !Array.isArray(cell.citations) || !cell.citations.length) return false;
  const claim = claims[cell.claimId];
  return claim?.reviewState === 'accepted' && cell.citations.every(citation =>
    citation.sourceId && sources[citation.sourceId]?.url === citation.href &&
    /^https:\/\//.test(citation.href || '') && citation.title?.trim() && citation.locator?.trim() &&
    claim.supporting?.some(item => item.sourceId === citation.sourceId && item.locator === citation.locator));
}
