import React from 'react';
import './reader.css';
import { uniqueCitations } from '../../seo.js';
import { METHODS_COPY } from '../../page-copy.js';
import { homeBodyHtml } from '../../static-pages.js';

export function HomePage() {
  return <div className="intro-page reader-home" dangerouslySetInnerHTML={{ __html: homeBodyHtml() }} />;
}

export function MethodsPage() {
  return <div className="intro-page reader-methods">
    <p className="eyebrow">{METHODS_COPY.eyebrow}</p><h1>{METHODS_COPY.title}</h1>
    {METHODS_COPY.sections.map(section => <section key={section.id} id={section.id}><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
    <ul>{METHODS_COPY.sourceLinks.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
  </div>;
}

function ReaderSummary({ summary, brief, citations = [] }) {
  if (!summary && brief) return <section className="reader-summary" aria-label="Chapter summary">
    <p className="reader-summary-label">In brief</p><p>{brief.body}</p><p className="small-note"><a href={brief.href}>Jump to the key takeaways ↓</a></p>
  </section>;
  if (!summary) return null;
  return <section className="reader-summary" aria-label="Chapter summary">
    {summary.question && <><p className="reader-summary-label">The question</p><h2>{summary.question}</h2></>}
    {summary.answer && <><p className="reader-summary-label">Short answer</p><p>{summary.answer}</p></>}
    {summary.takeaways?.length > 0 && <><p className="reader-summary-label">Key takeaways</p><ul>{summary.takeaways.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
    {citations.length > 0 && <p className="answer-sources">Sources for specific chapter claims: {uniqueCitations(citations).map((item, index) => <React.Fragment key={`${item.claimId}|${item.url}|${item.locator}`}>{index > 0 && "; "}<a href={item.url}>{item.title || item.publisher}</a>, {item.locator}</React.Fragment>)}.</p>}
  </section>;
}

export function ArticlePage({ v }) {
  return <article className="reader-article">
    {v.mobile && <label className="reader-mobile-contents">Contents and chapters<select aria-label="Reading contents and chapters" value="" onChange={e => { if (e.target.value) location.href = e.target.value; }}><option value="">Choose a section or chapter…</option>{v.toc.map(t => <option key={t.href} value={t.href}>{t.text}</option>)}<option disabled>— Other chapters —</option>{v.allChapters.map(t => <option key={t.href} value={t.href}>{t.optLabel}</option>)}</select></label>}
    <div className="reader-article-meta"><span>{v.volLabel}</span><span>{v.chapterLabel}</span><span>{v.readTime} min read</span></div>
    <h1>{v.chapterTitle}</h1>
    {v.volumeIntro && <p className="lead hub-intro">{v.volumeIntro}</p>}
    {!v.articleIsReference && <ReaderSummary summary={v.articleSummary} brief={v.articleBrief} citations={v.articleCitations} />}
    <div className="reader-article-body" style={{ fontSize: v.bodyFontSize }}>{v.articleBody}</div>
    {(v.hubChapters || []).length > 0 && <section className="static-item-list"><h2>Chapters in this volume</h2><ol>{v.hubChapters.map(item => <li key={item.href}><a href={item.href}>{item.title}</a></li>)}</ol></section>}
    <nav className="reader-chapter-nav" aria-label="Previous and next chapter"><div>{v.hasPrev && <><span>← Previous</span><a href={v.prevHref}>{v.prevTitle}</a></>}</div><div>{v.hasNext && <><span>Next →</span><a href={v.nextHref}>{v.nextTitle}</a></>}</div></nav>
  </article>;
}
