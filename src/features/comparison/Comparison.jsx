import React from 'react';
import './comparison.css';

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

// A cell is publishable only when the coordinator passes an accepted claim and
// at least one exact, reachable source locator. Packet proposals stay out of UI.
export function publishableCell(cell, claims = {}, sources = {}) {
  if (!cell || !cell.claimId || !cell.text?.trim() || !cell.scope?.trim() ||
      !cell.uncertainty?.trim() || !Array.isArray(cell.citations) || !cell.citations.length) return false;
  const claim = claims[cell.claimId];
  return claim?.reviewState === 'accepted' && cell.citations.every(citation =>
    citation.sourceId && sources[citation.sourceId]?.url === citation.href &&
    /^https:\/\//.test(citation.href || '') && citation.title?.trim() && citation.locator?.trim() &&
    claim.supporting?.some(item => item.sourceId === citation.sourceId && item.locator === citation.locator));
}

export default function Comparison({ v = {} }) {
  const use = USES.find(item => item.id === v.compareUse) || USES[0];
  const perspective = PERSPECTIVES.find(item => item.id === v.comparePerspective) || PERSPECTIVES[0];
  const cells = v.comparisonCells || {};
  const claims = v.comparisonClaims || {};
  const sources = v.comparisonSources || {};
  return <section className="intro-page comparison-feature" aria-labelledby="comparison-title">
    <p className="eyebrow">Comparison · evidence review</p>
    <h1 id="comparison-title">Compare monetary arrangements by use</h1>
    <p className="lead">Choose a use and whose decision you are considering. A claim appears only after its source, scope and limitations have been accepted for this comparison.</p>
    <div className="comparison-controls">
      <label htmlFor="comparison-use">Use</label>
      <select id="comparison-use" value={use.id} onChange={v.onCompareUse}>
        {USES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <label htmlFor="comparison-perspective">Perspective</label>
      <select id="comparison-perspective" value={perspective.id} onChange={v.onComparePerspective}>
        {PERSPECTIVES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </div>
    <div className="comparison-feature-scroll">
      <table>
        <caption>{use.label} · {perspective.label}. Evidence gaps are shown explicitly.</caption>
        <thead><tr><th scope="col">Arrangement</th><th scope="col">What the evidence supports</th><th scope="col">Limits and sources</th></tr></thead>
        <tbody>{ARRANGEMENTS.map(arrangement => {
          const cell = cells[`${arrangement.id}:${use.id}:${perspective.id}`];
          const accepted = publishableCell(cell, claims, sources);
          return <tr key={arrangement.id}>
            <th scope="row">{arrangement.label}</th>
            {accepted ? <>
              <td>{cell.text}<div className="comparison-scope">Scope: {cell.scope}</div></td>
              <td><div>Limit: {cell.uncertainty}</div><ul>{cell.citations.map((citation, index) =>
                <li key={index}><a href={citation.href} target="_blank" rel="noopener noreferrer">{citation.title} ↗</a> · {citation.locator}</li>)}</ul></td>
            </> : <>
              <td><span className="comparison-pending">Evidence pending</span><div>Arrangement-specific evidence has not cleared review for this use and perspective.</div></td>
              <td><a href={arrangement.research}>Read the research chapter →</a><div className="comparison-scope">Chapter claims may still be under review.</div></td>
            </>}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <p className="small-note">A missing cell is unknown here, not a negative score. Provider rules, legal protection, price behavior and settlement assurance can differ by place and date. <a href="/#/methods">Research method and sources →</a></p>
  </section>;
}
