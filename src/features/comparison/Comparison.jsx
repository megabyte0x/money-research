import React from 'react';
import './comparison.css';
import { ARRANGEMENTS, PERSPECTIVES, USES, publishableCell } from './model.js';

export { ARRANGEMENTS, PERSPECTIVES, USES, publishableCell };

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
  </section>;
}
