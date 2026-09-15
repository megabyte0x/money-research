import React from 'react';
import './discovery.css';

export function SearchView({ v }) {
  return <section className="discovery-view" aria-label="Search results">
    <h1>Search the research</h1>
    <p className="discovery-meta" aria-live="polite">{v.searchSummary}</p>
    <label className="search-filter">Volume <select aria-label="Filter search by volume" value={v.searchVol} onChange={v.onSearchVol}>
      <option value="">All volumes</option><option value="gold">I · Gold</option>
      <option value="after">II · After Gold</option><option value="bitcoin">III · Bitcoin</option>
    </select></label>
    {v.query.trim().length >= 2 && v.searchResults.length === 0 &&
      <p className="search-empty">No matching sections in {v.searchVol ? 'this volume' : 'the library'}. Try another term or choose All volumes. <a href="/#/home/volumes">Browse the volumes →</a></p>}
    <div className="discovery-results">
      {v.searchResults.map((result, i) => <a key={result.href + i} href={result.href} className="discovery-result">
        <span className="discovery-result-label">{result.label}{result.matches > 1 ? ` · ${result.matches} matching passages` : ''}</span>
        <span>{result.snippet.before}{result.snippet.match && <mark>{result.snippet.match}</mark>}{result.snippet.after}</span>
      </a>)}
    </div>
  </section>;
}

export function GlossaryView({ v }) {
  return <section className="discovery-view" aria-label="Glossary">
    <p className="discovery-meta">Glossary · {v.glossaryCount} terms across three volumes</p>
    <h1>Glossary</h1>
    <input type="search" placeholder="Filter terms" aria-label="Filter glossary terms" value={v.glq} onChange={v.onGlq} />
    <div className="discovery-glossary">
      {v.glossaryRows.map(term => <div key={term.id} id={term.id} className="discovery-definition">
        <strong>{term.term}</strong><div>
          <div>{term.defEl}</div>
          {term.review === 'accepted' && <>
            {term.exampleEl && <p className="discovery-example"><span>Illustration · </span>{term.exampleEl}</p>}
            {(term.relatedLinks?.length > 0 || term.chapterLinks?.length > 0) &&
              <div className="discovery-term-links">
                {term.relatedLinks?.length > 0 && <div className="discovery-link-group"><span>Related terms</span><ul className="discovery-link-list">{term.relatedLinks.map(link => <li key={link.id || link.href}><a href={link.href}>{link.label}</a></li>)}</ul></div>}
                {term.chapterLinks?.length > 0 && <div className="discovery-link-group"><span>Read further</span><ul className="discovery-link-list">{term.chapterLinks.map(link => <li key={link.id || link.href}><a href={link.href}>{link.label}</a></li>)}</ul></div>}
              </div>}
          </>}
        </div>
      </div>)}
      {v.glossaryRows.length === 0 && <p className="search-empty">No matching glossary terms. Try a shorter word or <a href="/#/home/volumes">browse the volumes</a>.</p>}
    </div>
  </section>;
}

export function SynthesisView({ v }) {
  // The coordinator supplies cross-volume paragraphs only after acceptance.
  // Until then, this view can browse approved chapter answers verbatim.
  const synthesis = v.synthesis;
  const rows = v.summaryRows || [];
  const topics = [...new Set(rows.flatMap(row => row.topics || []))].sort();
  const shown = rows.filter(row => (!v.summaryVolume || row.article.vol === v.summaryVolume) &&
    (!v.summaryTopic || row.topics.includes(v.summaryTopic)));
  return <section className="discovery-view" aria-label={synthesis ? 'Synthesis and chapter short answers' : 'Chapter short answers'}>
    {synthesis ? <>
      <p className="discovery-meta">Cross-volume reading · about five minutes</p><h1>{synthesis.title}</h1>
      {(synthesis.paragraphs || []).map((paragraph, i) =>
        <p key={i}>{v.renderSynthesisParagraph ? v.renderSynthesisParagraph(paragraph, i) : paragraph}</p>)}
      {(synthesis.links || []).length > 0 && <div className="discovery-synthesis-links">{synthesis.links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</div>}
    </> : null}
    <>
      <p className="discovery-meta">Editor-approved chapter answers</p>{synthesis ? <h2>Explore the short answers</h2> : <h1>Explore the short answers</h1>}
      <p>Browse the questions from individual chapters. Each answer keeps its own scope; follow the chapter for context and source links.</p>
      <div className="discovery-filters">
        <label>Volume <select value={v.summaryVolume || ''} onChange={v.onSummaryVolume}>
          <option value="">All volumes</option><option value="gold">Gold</option><option value="after">After Gold</option><option value="bitcoin">Bitcoin</option>
        </select></label>
        <label>Topic <select value={v.summaryTopic || ''} onChange={v.onSummaryTopic}>
          <option value="">All topics</option>{topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
        </select></label>
      </div>
      <p className="discovery-meta" aria-live="polite">{shown.length} chapter answers</p>
      <div className="discovery-summary-list">{shown.map(row => <article key={row.id} className="discovery-summary">
        <p className="discovery-meta">{row.article.vol} · {row.role === 'topic' ? row.topics.join(' · ') : 'reference'}</p>
        <h2><a href={row.href}>{row.summary.question || row.title}</a></h2><p>{row.summary.answer}</p>
        {(row.summary.evidence || row.summary.uncertainty || row.summary.evidenceAndUncertainty) && <p className="discovery-meta">{row.summary.evidence && <>Evidence: {row.summary.evidence} </>}{row.summary.uncertainty && <>Still uncertain: {row.summary.uncertainty} </>}{row.summary.evidenceAndUncertainty && <>Evidence and limits: {row.summary.evidenceAndUncertainty}</>}</p>}
      </article>)}</div>
      {shown.length === 0 && <p className="search-empty">No approved chapter answers match these filters. Choose All volumes or All topics.</p>}
    </>
  </section>;
}
