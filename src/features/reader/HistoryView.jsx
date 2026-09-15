import React from 'react';
import './reader.css';
import { HISTORY_STAGES as STAGES } from '../../history-stages.js';

function Stage({ stage, index }) {
  return <section className="reader-history-stage" id={stage.id} data-stage={index + 1} aria-labelledby={`${stage.id}-title`}>
    <div className="reader-history-era"><span>{String(index + 1).padStart(2, '0')}</span>{stage.era}</div>
    <div className="reader-history-copy"><h2 id={`${stage.id}-title`}>{stage.title}</h2>
      <dl><div><dt>Anchor</dt><dd>{stage.anchor}</dd></div><div><dt>Who held power</dt><dd>{stage.power}</dd></div><div><dt>What changed</dt><dd>{stage.change}</dd></div></dl>
      <p className="reader-history-limit"><strong>Scope and uncertainty:</strong> {stage.limit}</p>
      <a href={stage.href}>Read the related chapter →</a>
    </div>
  </section>;
}

export default function HistoryView({ v }) {
  return <div className="history-arc reader-history">
    <div className="evidence-notice" role="note">This selective historical arc is under editorial review. Quantitative charts are withheld until their series, definitions and source locations are verified. <a href="/methods/">Read the research method →</a></div>
    <p className="eyebrow">History · eleven arrangements and turning points</p>
    <h1>Monetary arrangements overlap and change under pressure.</h1>
    <p className="reader-history-intro">This arc follows selected uses of metal, coin, redeemable notes, bank deposits, central-bank reserves and digital systems. Each stage has a different geographic and legal scope. The interwar bridge separates the classical gold standard from Bretton Woods; Bitcoin and dollar stablecoins developed alongside fiat systems.</p>
    <label className="reader-history-picker">Jump to a regime
      <select aria-label="Jump to a History regime" value="" onChange={e => { if (e.target.value) location.href = e.target.value; }}>
        <option value="">Choose a regime or turning point…</option>
        {STAGES.map((stage, index) => <option key={stage.id} value={`/arc/#${stage.id}`}>{index + 1}. {stage.title} · {stage.era}</option>)}
      </select>
    </label>
    <nav className="reader-history-progress" aria-label="History progress" style={{ top: v.stickyTop }}>
      <div className="reader-history-progress-label"><span>Stage {String(v.arcStage || 1).padStart(2, '0')} of {STAGES.length}</span><strong>{STAGES[(v.arcStage || 1) - 1].title}</strong></div>
      <div className="reader-history-progress-track">{STAGES.map((stage, index) =>
        <a key={stage.id} href={`/arc/#${stage.id}`} title={`${index + 1}. ${stage.title}`} aria-label={`Stage ${index + 1} of ${STAGES.length}: ${stage.title}`} aria-current={v.arcStage === index + 1 ? 'location' : undefined} className={index + 1 <= (v.arcStage || 1) ? 'is-complete' : ''}><span>{index + 1}</span></a>)}</div>
    </nav>
    <div className="reader-history-stages">{STAGES.map((stage, index) => <Stage key={stage.id} stage={stage} index={index} />)}</div>
    <div className="reader-history-end"><h2>What stays</h2><p>Metal, sovereign money, bank credit and digital networks coexist because users need different combinations of accessible payments, stable prices, credit, final settlement and control over custody. The comparative question is which arrangement works for which use, who can change its rules and who bears the risk when a promise fails.</p><a href="/timeline/">Explore the connected timeline →</a></div>
  </div>;
}

export { STAGES as HISTORY_STAGES };
