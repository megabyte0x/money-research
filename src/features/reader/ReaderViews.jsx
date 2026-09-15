import React from 'react';
import './reader.css';
import { METHODS_COPY } from '../../page-copy.js';

const jobs = [
  ['Store of value', 'Carries purchasing power through time.'],
  ['Medium of exchange', 'Helps people pay for goods and services.'],
  ['Unit of account', 'States prices, wages and debts.'],
  ['Settlement asset', 'Discharges an obligation between parties or institutions.']
];

export function HomePage({ v }) {
  return <div className="intro-page reader-home">
    <p className="eyebrow">An evidence-led guide · three research volumes</p>
    <h1>How money works—and why it changes.</h1>
    <p className="lead">Explore gold, government currencies and Bitcoin through history, evidence and the trade-offs between saving, paying, pricing and settling.</p>
    <nav className="reader-actions" aria-label="Start reading"><a href="#volumes">Browse the volumes →</a><a href="/arc/">Read History →</a><a href="/compare/">Compare arrangements →</a></nav>
    <h2>Four jobs, different arrangements</h2>
    <div className="reader-jobs">{jobs.map(([name, description]) => <div key={name}><h3>{name}</h3><p>{description}</p></div>)}</div>
    <p>One arrangement need not do all four jobs. A useful comparison starts with what someone holds, who owes a claim and who controls its transfer.</p>
    <h2>Follow a question</h2>
    <div className="question-grid">
      <a href="/gold/08-why-the-dollar-replaced-gold/">Why did gold lose its monetary role?<small>Convertibility, crisis and the dollar network · Vol. I</small></a>
      <a href="/after/01-the-break-1971-1976/">What supports money today?<small>Institutions, bank liabilities and acceptance · Vol. II</small></a>
      <a href="/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/">What did Bitcoin solve?<small>Transfer rules, custody and remaining risks · Vol. III</small></a>
    </div>
    <h2>Compare the claims</h2>
    <p>Cash is an issuer liability; a bank balance is a claim on a bank; physical gold is an asset held somewhere; self-custodied Bitcoin depends on key control. An exchange balance or stablecoin adds another issuer or custodian. <a href="/compare/">Compare these arrangements by use →</a></p>
    <p>To see why deposits, reserves and bonds are distinct, <a href="/mechanics/">follow four stylised £100 transactions →</a></p>
    <h2>History overlaps</h2>
    <p>Classical gold convertibility was interrupted by the First World War. Interwar attempts to restore it differed from the post-1944 Bretton Woods dollar system. Since the 1970s, fiat currencies, gold reserves, bank deposits and newer digital arrangements have coexisted. Bitcoin is one development within that overlap.</p>
    <nav className="reader-actions" aria-label="Explore history"><a href="/arc/">Read the eleven-stage arc →</a><a href="/timeline/">Explore the connected timeline →</a></nav>
    <h2 id="volumes">Three research volumes</h2>
    <div className="reader-volumes">{(v.homeVolumes || []).map(volume => <div key={volume.id} className={`reader-volume reader-volume-${volume.id}`}><a href={volume.href}><span className="reader-volume-cue">{volume.label}</span><strong>{volume.title}</strong><span>{volume.question}</span></a></div>)}</div>
    <p className="small-note">Each volume begins with a directory and links to its source list. Choose a volume above to see its files.</p>
    <h2>What evidence can and cannot settle</h2>
    <p>Bitcoin permits transfer without a central account operator, yet broad use for wages, prices and debts remains uncertain. Claims about adoption, comparative returns and official reserves require populations, dates and precise source locations. Quantitative charts in the historical arc remain withheld while their datasets are checked.</p>
    <p className="small-note"><a href="/methods/">Read the research method →</a></p>
  </div>;
}

export function MethodsPage() {
  return <div className="intro-page reader-methods">
    <p className="eyebrow">{METHODS_COPY.eyebrow}</p><h1>{METHODS_COPY.title}</h1>
    {METHODS_COPY.sections.map(section => <section key={section.id} id={section.id}><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
    <ul>{METHODS_COPY.sourceLinks.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
  </div>;
}

function ReaderSummary({ summary }) {
  if (!summary) return null;
  return <section className="reader-summary" aria-label="Chapter summary">
    {summary.question && <><p className="reader-summary-label">The question</p><h2>{summary.question}</h2></>}
    {summary.answer && <><p className="reader-summary-label">Short answer</p><p>{summary.answer}</p></>}
    {summary.takeaways?.length > 0 && <><p className="reader-summary-label">Key takeaways</p><ul>{summary.takeaways.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
  </section>;
}

export function ArticlePage({ v }) {
  return <article className="reader-article">
    {v.mobile && <label className="reader-mobile-contents">Contents and chapters<select aria-label="Reading contents and chapters" value="" onChange={e => { if (e.target.value) location.href = e.target.value; }}><option value="">Choose a section or chapter…</option>{v.toc.map(t => <option key={t.href} value={t.href}>{t.text}</option>)}<option disabled>— Other chapters —</option>{v.allChapters.map(t => <option key={t.href} value={t.href}>{t.optLabel}</option>)}</select></label>}
    <div className="reader-article-meta"><span>{v.volLabel}</span><span>File {v.chapterNum}</span><span>{v.readTime} min read</span><span>{v.wordCount} words</span></div>
    <h1>{v.chapterTitle}</h1>
    <div className="evidence-notice" role="note">This research chapter is under editorial review. Treat dated figures, legal status and broad conclusions as claims to verify against the <a href="/methods/">source lists and method</a>.</div>
    {!v.articleIsReference && <ReaderSummary summary={v.articleSummary} />}
    <div className="reader-article-body" style={{ fontSize: v.bodyFontSize }}>{v.articleBody}</div>
    {(v.articleEvidence || []).length > 0 && <aside className="reader-dated-evidence" aria-label="Dated evidence"><h2>Dated evidence in this chapter</h2><ul>{v.articleEvidence.map(item =>
      <li key={item.observationId}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.publisher}: {item.title} ↗</a>, {item.locator}. Observation period: {item.period}. {item.uncertainty}</li>)}</ul></aside>}
    {(v.hubChapters || []).length > 0 && <section className="static-item-list"><h2>Chapters in this volume</h2><ol>{v.hubChapters.map(item => <li key={item.href}><a href={item.href}>{item.title}</a></li>)}</ol></section>}
    <nav className="reader-chapter-nav" aria-label="Adjacent chapters"><div>{v.hasPrev && <><span>← Previous</span><a href={v.prevHref}>{v.prevTitle}</a></>}</div><div>{v.hasNext && <><span>Next →</span><a href={v.nextHref}>{v.nextTitle}</a></>}</div></nav>
  </article>;
}
