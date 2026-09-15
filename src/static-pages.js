import { tokenizeInline, isSafeContentHref, sourceUrlLabel, stripInline } from './md.js';
import { referenceSegments } from './references.js';
import { articleHref, canonicalPath, isDirectoryRecord, sharedViewForRecord, shortTitle, VOLUME_IDS } from './routes.js';
import { absoluteUrl } from './site-config.js';
import { escapeHtml, uniqueCitations, VOLUME_NAME, VOLUME_ROMAN } from './seo.js';
import { DISCOVERY_COPY, HOME_COPY, METHODS_COPY, NOT_FOUND_COPY, SEARCH_COPY } from './page-copy.js';
import { HISTORY_STAGES } from './history-stages.js';
import { ARRANGEMENTS, PERSPECTIVES, USES, publishableCell } from './features/comparison/model.js';
import { eventSortValue, eventYear, mergeSharedEvents } from './timeline.js';
import { contentRole } from './features/discovery/catalog.js';

const EVIDENCE_NOTICE = 'This research chapter is under editorial review. Dated figures, legal status and broad conclusions require source verification.';

export function breadcrumbHtml(crumbs) {
  if (!crumbs?.length) return '';
  return `<nav class="static-breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map((crumb, index) => {
    const current = index === crumbs.length - 1;
    return `<li>${current ? `<span aria-current="page">${escapeHtml(crumb.name)}</span>` : `<a href="${escapeHtml(crumb.path)}">${escapeHtml(crumb.name)}</a>`}</li>`;
  }).join('')}</ol></nav>`;
}

export function citationLinksHtml(citations = []) {
  const items = uniqueCitations(citations);
  if (!items.length) return '';
  return `<p class="answer-sources">Sources: ${items.map(item =>
    `<a href="${escapeHtml(item.url)}">${escapeHtml(item.publisher || item.title)}</a>, ${escapeHtml(item.locator)}`).join('; ')}.</p>`;
}

function linkedText(text, record, byVolumeNumber) {
  return referenceSegments(text, record?.vol, byVolumeNumber).map(part => part.type === 'ref'
    ? `<a href="${escapeHtml(articleHref(part.record))}" title="${escapeHtml(part.record.vol.toUpperCase() + ' · file ' + part.record.num)}">${escapeHtml(part.text)}</a>`
    : escapeHtml(part.text)).join('');
}

export function inlineHtml(text, record, byVolumeNumber) {
  return tokenizeInline(text, { linkifyUrls: ['gold-12', 'after-13', 'bitcoin-16', 'zcash-17'].includes(record?.id) }).map(token => {
    const value = escapeHtml(token.auto ? sourceUrlLabel(token.href) : token.v);
    if (token.t === 'b') return `<strong>${value}</strong>`;
    if (token.t === 'i') return `<em>${value}</em>`;
    if (token.t === 'code') return `<code>${value}</code>`;
    if (token.t === 'link') {
      const href = token.href.trim();
      return isSafeContentHref(href) ? `<a href="${escapeHtml(href)}"${token.auto ? ` class="source-url" title="${escapeHtml(href)}"` : ''}>${value}</a>` : value;
    }
    if (token.t === 'text') return linkedText(token.v, record, byVolumeNumber);
    return value;
  }).join('');
}

export function blocksHtml(blocks, record, byVolumeNumber, { idPrefix = '' } = {}) {
  return blocks.map(block => {
    const id = idPrefix + block.id;
    if (/^h[1-4]$/.test(block.type)) {
      const aliases = !idPrefix
        ? Object.entries(record.sectionAliases || {}).filter(([, target]) => target === block.id)
          .map(([oldId]) => `<span id="${escapeHtml(oldId)}" aria-hidden="true" class="section-alias"></span>`).join('')
        : '';
      return `${aliases}<${block.type} id="${escapeHtml(id)}">${inlineHtml(block.text, record, byVolumeNumber)}</${block.type}>`;
    }
    if (block.type === 'p') return `<p>${inlineHtml(block.text, record, byVolumeNumber)}</p>`;
    if (block.type === 'quote') return `<blockquote>${inlineHtml(block.text, record, byVolumeNumber)}</blockquote>`;
    if (block.type === 'ul' || block.type === 'ol') {
      return `<${block.type}>${block.items.map(item => `<li>${inlineHtml(item, record, byVolumeNumber)}</li>`).join('')}</${block.type}>`;
    }
    if (block.type === 'hr') return '<hr>';
    if (block.type === 'table') {
      const caption = record.slug.includes('timeline') ? `<caption>Dated events in this chapter. Quantities remain under review.</caption>` : '';
      return `<div class="static-table-wrap"><table>${caption}<thead><tr>${block.header.map(cell => `<th scope="col">${inlineHtml(cell, record, byVolumeNumber)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${inlineHtml(cell, record, byVolumeNumber)}</th>` : `<td>${inlineHtml(cell, record, byVolumeNumber)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    return '';
  }).join('\n');
}

export function summaryHtml(metadata) {
  if (!metadata?.summary) return '';
  const summary = metadata.summary;
  const takeaways = summary.takeaways?.length ? `<ul>${summary.takeaways.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  return `<section class="static-summary" aria-label="Chapter summary">${summary.question ? `<h2>${escapeHtml(summary.question)}</h2>` : ''}<p>${escapeHtml(summary.answer)}</p>${takeaways}</section>`;
}

export function staticArticle(record, model, page) {
  const key = `${record.slug}@${record.vol}`;
  const blocks = model.blocks[key];
  if (!blocks) throw new Error(`Missing indexed article: ${record.id}`);
  const byVolumeNumber = new Map(model.manifest.map(item => [`${item.vol}/${item.num}`, item]));
  const metadata = model.articleMetadata[record.id];
  const sections = blocks.filter(block => block.type === 'h2');
  const toc = sections.length
    ? `<nav class="static-toc" aria-label="Chapter contents"><p>On this page</p><ol>${sections.map(block => `<li><a href="${escapeHtml(articleHref(record, block.id))}">${inlineHtml(block.text, record, byVolumeNumber)}</a></li>`).join('')}</ol></nav>`
    : '';
  const heading = blocks.find(block => block.type === 'h1');
  const rest = blocks.filter(block => block !== heading);
  const h1 = heading
    ? `${Object.entries(record.sectionAliases || {}).filter(([, target]) => target === heading.id).map(([oldId]) => `<span id="${escapeHtml(oldId)}" aria-hidden="true" class="section-alias"></span>`).join('')}<h1 id="${escapeHtml(heading.id)}">${inlineHtml(heading.text, record, byVolumeNumber)}</h1>`
    : `<h1>${escapeHtml(shortTitle(record))}</h1>`;
  const chapterNav = volumeChapterList(record.vol, model.manifest);
  return `<main id="main-content" class="static-article">${breadcrumbHtml(page.breadcrumbs)}<p class="eyebrow">Volume ${VOLUME_ROMAN[record.vol]} · ${VOLUME_NAME[record.vol]} · <a href="/">Money Research</a></p><p class="evidence-notice">${EVIDENCE_NOTICE}</p>${h1}${toc}${contentRole(record) === 'topic' ? summaryHtml(metadata) : ''}${blocksHtml(rest, record, byVolumeNumber)}${isDirectoryRecord(record) ? chapterNav : ''}</main>`;
}

export function volumeChapterList(vol, manifest, heading = 'Chapters in this volume') {
  const chapters = manifest.filter(item => item.vol === vol && !isDirectoryRecord(item) && !sharedViewForRecord(item));
  return `<section class="static-item-list"><h2>${escapeHtml(heading)}</h2><ol>${chapters.map(item => `<li><a href="${escapeHtml(canonicalPath(item))}">${escapeHtml(shortTitle(item))}</a></li>`).join('')}</ol></section>`;
}

export function hubItemList(vol, manifest) {
  return manifest.filter(item => item.vol === vol && !isDirectoryRecord(item) && !sharedViewForRecord(item))
    .map(item => ({ name: shortTitle(item), url: absoluteUrl(canonicalPath(item)) }));
}

export function staticHome(manifest, page) {
  const volumes = VOLUME_IDS.map(vol => {
    const names = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin', zcash: 'Zcash' };
    const labels = { gold: 'Vol. I · Gold', after: 'Vol. II · After Gold', bitcoin: 'Vol. III · Bitcoin', zcash: 'Vol. IV · Zcash' };
    return {
      vol, title: names[vol], label: labels[vol], href: `/${vol}/`,
      question: HOME_COPY.volumeQuestions[vol],
    };
  });
  return `<main id="main-content" class="static-article intro-page reader-home">${breadcrumbHtml(page.breadcrumbs)}
<h1>${escapeHtml(HOME_COPY.title)}</h1>
<p class="lead">${escapeHtml(HOME_COPY.lead)}</p>
<nav class="reader-actions" aria-label="Start reading"><a href="#volumes">Browse the volumes →</a><a href="/arc/">Read History →</a><a href="/compare/">Compare arrangements →</a></nav>
<h2>Four jobs, different arrangements</h2>
<div class="reader-jobs">${HOME_COPY.jobs.map(([name, description]) => `<div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p></div>`).join('')}</div>
<p>One arrangement need not do all four jobs. A useful comparison starts with what someone holds, who owes a claim and who controls its transfer.</p>
<h2>Follow a question</h2>
<div class="question-grid">${HOME_COPY.questions.map(item => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}<small>${escapeHtml(item.note)}</small></a>`).join('')}</div>
<h2>Compare the claims</h2>
<p>Cash is an issuer liability; a bank balance is a claim on a bank; physical gold is an asset held somewhere; self-custodied Bitcoin depends on key control. An exchange balance or stablecoin adds another issuer or custodian. <a href="/compare/">Compare these arrangements by use →</a></p>
<p>To see why deposits, reserves and bonds are distinct, <a href="/mechanics/">follow four stylised £100 transactions →</a></p>
<h2>History overlaps</h2>
<p>Classical gold convertibility was interrupted by the First World War. Interwar attempts to restore it differed from the post-1944 Bretton Woods dollar system. Since the 1970s, fiat currencies, gold reserves, bank deposits and newer digital arrangements have coexisted. Bitcoin and Zcash are different developments within that overlap, with different transparency and operational trade-offs.</p>
<nav class="reader-actions" aria-label="Explore history"><a href="/arc/">Read the eleven-stage arc →</a><a href="/timeline/">Explore the connected timeline →</a></nav>
<h2 id="volumes">Four research volumes</h2>
<div class="reader-volumes">${volumes.map(volume => `<div class="reader-volume reader-volume-${volume.vol}"><a href="${volume.href}"><span class="reader-volume-cue">${escapeHtml(volume.label)}</span><strong>${escapeHtml(volume.title)}</strong><span>${escapeHtml(volume.question)}</span></a></div>`).join('')}</div>
<h2>What evidence can and cannot settle</h2>
<p>Bitcoin and Zcash permit transfer without a central account operator, yet broad use for wages, prices and debts remains uncertain. Claims about adoption, privacy, comparative returns and official reserves require populations, dates and precise source locations. Quantitative charts in the historical arc remain withheld while their datasets are checked.</p>
<p class="small-note"><a href="/methods/">Read the research method →</a></p>
</main>`;
}

export function staticMethods(page) {
  return `<main id="main-content" class="static-article intro-page reader-methods">${breadcrumbHtml(page.breadcrumbs)}
<p class="eyebrow">${escapeHtml(METHODS_COPY.eyebrow)}</p>
<h1>${escapeHtml(METHODS_COPY.title)}</h1>
${METHODS_COPY.sections.map(section => `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}
<ul>${METHODS_COPY.sourceLinks.map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
</main>`;
}

export function staticGlossary(glossary, page) {
  return `<main id="main-content" class="static-article discovery-view">${breadcrumbHtml(page.breadcrumbs)}
<p class="discovery-meta">Glossary · ${glossary.length} terms across four volumes</p>
<h1>${escapeHtml(DISCOVERY_COPY.glossary.title)}</h1>
<div class="discovery-glossary">${glossary.map(term => `<div id="${escapeHtml(term.id)}" class="discovery-definition"><strong>${escapeHtml(term.term)}</strong><div>${escapeHtml(stripInline(term.def || term.definition || ''))}</div></div>`).join('')}</div>
</main>`;
}

export function staticSources(model, page) {
  const labels = { gold: 'Volume I · Gold', after: 'Volume II · After Gold', bitcoin: 'Volume III · Bitcoin', zcash: 'Volume IV · Zcash' };
  const byVolumeNumber = new Map(model.manifest.map(item => [`${item.vol}/${item.num}`, item]));
  const records = VOLUME_IDS.map(vol => model.manifest.find(item => item.vol === vol && sharedViewForRecord(item) === 'sources')).filter(Boolean);
  return `<main id="main-content" class="static-article discovery-view">${breadcrumbHtml(page.breadcrumbs)}
<p class="discovery-meta">Sources · four research volumes</p>
<h1>${escapeHtml(DISCOVERY_COPY.sources.title)}</h1>
<p>Source lists and further reading from all four volumes are collected here. Entries retain their original volume and editorial scope.</p>
${records.map(record => `<section id="sources-${escapeHtml(record.vol)}" class="sources-volume"><h2>${escapeHtml(labels[record.vol])}</h2>${blocksHtml((model.blocks[`${record.slug}@${record.vol}`] || []).filter(block => block.type !== 'h1'), record, byVolumeNumber, { idPrefix: `sources-${record.vol}-` })}</section>`).join('\n')}
</main>`;
}

export function staticSearch(page) {
  return `<main id="main-content" class="static-article discovery-view">${breadcrumbHtml(page.breadcrumbs)}
<h1>${escapeHtml(SEARCH_COPY.title)}</h1>
<p>Search runs in the browser after the research index loads. Type a term in the header, or <a href="/">return to the homepage</a> and browse a volume.</p>
<p class="small-note">Search query pages are utilities and are not offered for indexing.</p>
</main>`;
}

export function staticNotFound(page) {
  return `<main id="main-content" class="static-article intro-page">${breadcrumbHtml(page.breadcrumbs)}
<h1>${escapeHtml(NOT_FOUND_COPY.title)}</h1>
<p>This address is not a published Money Research page. It may have been typed incorrectly, or it may never have been a canonical URL.</p>
<nav class="reader-actions" aria-label="Continue"><a href="/">Money Research home →</a><a href="/gold/">Gold volume →</a><a href="/after/">After Gold volume →</a><a href="/bitcoin/">Bitcoin volume →</a><a href="/zcash/">Zcash volume →</a><a href="/methods/">Research method →</a></nav>
</main>`;
}

export function staticTakeaways(manifest, articleMetadata, page) {
  const rows = manifest.map(article => {
    const metadata = articleMetadata[article.id];
    if (!metadata?.summary?.answer) return null;
    return { article, metadata };
  }).filter(Boolean);
  return `<main id="main-content" class="static-article discovery-view">${breadcrumbHtml(page.breadcrumbs)}
<p class="discovery-meta">Editor-approved chapter answers</p>
<h1>${escapeHtml(DISCOVERY_COPY.takeaways.title)}</h1>
<p>Browse the questions from individual chapters. Each answer keeps its own scope; follow the chapter for context and source links.</p>
<div class="discovery-summary-list">${rows.map(row => `<article class="discovery-summary">
<p class="discovery-meta">${escapeHtml(row.article.vol)}</p>
<h2><a href="${escapeHtml(canonicalPath(row.article))}">${escapeHtml(row.metadata.summary.question)}</a></h2>
<p>${escapeHtml(row.metadata.summary.answer)}</p>
${citationLinksHtml(row.metadata.citations)}
${row.metadata.summary.evidenceAndUncertainty ? `<p class="discovery-meta">Evidence and limits: ${escapeHtml(row.metadata.summary.evidenceAndUncertainty)}</p>` : ''}
</article>`).join('')}</div>
</main>`;
}

export function staticArc(page) {
  return `<main id="main-content" class="static-article history-arc reader-history">${breadcrumbHtml(page.breadcrumbs)}
<div class="evidence-notice" role="note">This selective historical arc is under editorial review. Quantitative charts are withheld until their series, definitions and source locations are verified. <a href="/methods/">Read the research method →</a></div>
<p class="eyebrow">History · eleven arrangements and turning points</p>
<h1>${escapeHtml(DISCOVERY_COPY.arc.title)}</h1>
<p class="reader-history-intro">This arc follows selected uses of metal, coin, redeemable notes, bank deposits, central-bank reserves and digital systems. Each stage has a different geographic and legal scope. The interwar bridge separates the classical gold standard from Bretton Woods; Bitcoin and dollar stablecoins developed alongside fiat systems.</p>
<nav class="static-toc" aria-label="Regimes"><ol>${HISTORY_STAGES.map((stage, index) => `<li><a href="#${escapeHtml(stage.id)}">${index + 1} · ${escapeHtml(stage.title)}</a></li>`).join('')}</ol></nav>
${HISTORY_STAGES.map((stage, index) => `<section class="reader-history-stage" id="${escapeHtml(stage.id)}" data-stage="${index + 1}">
<div class="reader-history-era"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(stage.era)}</div>
<div class="reader-history-copy"><h2 id="${escapeHtml(stage.id)}-title">${escapeHtml(stage.title)}</h2>
<dl><div><dt>Anchor</dt><dd>${escapeHtml(stage.anchor)}</dd></div><div><dt>Who held power</dt><dd>${escapeHtml(stage.power)}</dd></div><div><dt>What changed</dt><dd>${escapeHtml(stage.change)}</dd></div></dl>
<p class="reader-history-limit"><strong>Scope and uncertainty:</strong> ${escapeHtml(stage.limit)}</p>
<a href="${escapeHtml(stage.href)}">Read the related chapter →</a></div>
</section>`).join('')}
<div class="reader-history-end"><h2>What stays</h2><p>Metal, sovereign money, bank credit and digital networks coexist because users need different combinations of accessible payments, stable prices, credit, final settlement and control over custody. The comparative question is which arrangement works for which use, who can change its rules and who bears the risk when a promise fails.</p><a href="/timeline/">Explore the connected timeline →</a></div>
</main>`;
}

export function staticCompare(model, page) {
  const use = USES[0];
  const perspective = PERSPECTIVES[0];
  const cells = model.comparisonCells || {};
  const claims = model.claims || {};
  const sources = model.sources || {};
  const rows = ARRANGEMENTS.map(arrangement => {
    const cell = cells[`${arrangement.id}:${use.id}:${perspective.id}`];
    const accepted = publishableCell(cell, claims, sources);
    if (accepted) {
      return `<tr><th scope="row">${escapeHtml(arrangement.label)}</th><td>${escapeHtml(cell.text)}<div class="comparison-scope">Scope: ${escapeHtml(cell.scope)}</div></td><td><div>Limit: ${escapeHtml(cell.uncertainty)}</div><ul>${cell.citations.map(citation => `<li><a href="${escapeHtml(citation.href)}">${escapeHtml(citation.title)}</a> · ${escapeHtml(citation.locator)}</li>`).join('')}</ul></td></tr>`;
    }
    return `<tr><th scope="row">${escapeHtml(arrangement.label)}</th><td><span class="comparison-pending">Evidence pending</span><div>Arrangement-specific evidence has not cleared review for this use and perspective.</div></td><td><a href="${escapeHtml(arrangement.research)}">Read the research chapter →</a></td></tr>`;
  }).join('');
  return `<main id="main-content" class="static-article intro-page comparison-feature">${breadcrumbHtml(page.breadcrumbs)}
<p class="eyebrow">Comparison · evidence review</p>
<h1>${escapeHtml(DISCOVERY_COPY.compare.title)}</h1>
<p class="lead">A claim appears only after its source, scope and limitations have been accepted for this comparison. The static table shows the household / saving-purchasing-power view; other uses are available in the interactive page.</p>
<table><caption>${escapeHtml(use.label)} · ${escapeHtml(perspective.label)}. Evidence gaps are shown explicitly.</caption>
<thead><tr><th scope="col">Arrangement</th><th scope="col">What the evidence supports</th><th scope="col">Limits and sources</th></tr></thead>
<tbody>${rows}</tbody></table>
</main>`;
}

export function staticMechanics(page) {
  return `<main id="main-content" class="static-article intro-page mechanics-page">${breadcrumbHtml(page.breadcrumbs)}
<p class="eyebrow">Explainer · stylised £100 examples · UK institutional frame</p>
<h1>${escapeHtml(DISCOVERY_COPY.mechanics.title)}</h1>
<p class="lead">A loan, a payment, a government bond and a central-bank asset purchase are four different transactions. Following who gains an asset and who owes a liability prevents “money printing” from standing in for all of them.</p>
<p class="small-note">These examples omit interest, fees, taxes and later transactions. A “+£100” is a change, not an account's total balance. They explain mechanics, not the net effect of a policy on inflation or welfare.</p>
<nav class="mechanics-jump" aria-label="Explainer contents"><a href="#mechanics-loan">Bank loan</a><a href="#mechanics-payment">Payment</a><a href="#mechanics-bond">Bond issue</a><a href="#mechanics-qe">QE purchase</a></nav>
<section id="mechanics-loan"><h2>1. A bank makes a £100 loan</h2>
<p>The bank records a £100 claim on the borrower and credits the borrower's deposit account by £100. The customer gains a spendable bank deposit and owes the loan. No other saver had to hand over an existing deposit first; no central-bank reserves are transferred at this instant.</p>
<p>Repaying the loan principal later reduces the bank's loan asset and a deposit liability. Lending is not unlimited: borrower demand, expected losses, capital, liquidity, funding costs, profitability, regulation and monetary policy all matter. <a href="https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf">Source: Bank of England, 2014, pp. 16–20 →</a></p></section>
<section id="mechanics-payment"><h2>2. The borrower pays someone at another bank</h2>
<p>Suppose that borrower sends the £100 deposit to a seller at a different bank. The first bank reduces the borrower's deposit and transfers £100 of reserves to the second bank. The second bank credits the seller's deposit. The deposit has moved between people and banks; the banking system has not created another £100 of customer deposits merely by making this payment.</p>
<p>Reserves are balances that eligible institutions hold at the central bank to settle with one another; ordinary households cannot spend reserves directly. <a href="https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf">Source: Bank of England, 2014, Figure 2 and pp. 18–19 →</a></p></section>
<section id="mechanics-bond"><h2>3. A government issues a new bond</h2>
<p>A new bond is the government's promise to pay its holder under specified terms. If a non-bank investor buys a newly issued £100 bond, the investor exchanges a deposit for that bond; the government receives the proceeds and takes on a £100 bond liability. That is borrowing, not a commercial-bank loan to the investor and not a central-bank QE purchase.</p>
<p><a href="https://www.dmo.gov.uk/investor-information/">Source: UK Debt Management Office, gilt financing →</a></p></section>
<section id="mechanics-qe"><h2>4. The central bank buys an existing bond</h2>
<p>In the Bank of England's stylised QE example, a pension fund sells a £100 government bond that it already owns. The pension fund receives a £100 deposit at its commercial bank. The central bank acquires the bond and credits that bank with £100 of new reserves. The bank's new reserve asset is matched by a new deposit liability to the pension fund—not a free £100 windfall.</p>
<p>QE may influence yields, asset prices and spending; it does not mechanically force banks to make new loans. <a href="https://www.bankofengland.co.uk/monetary-policy/quantitative-easing">Plain-language QE guide →</a></p></section>
<section id="mechanics-takeaway"><h2>What to keep distinct</h2>
<p><strong>Deposits</strong> are commercial banks' promises to customers. <strong>Reserves</strong> are central-bank promises to eligible institutions. <strong>Government bonds</strong> are borrowing obligations. <strong>QE</strong> swaps an existing asset for newly created reserves and, when the seller is a non-bank, a matching customer deposit.</p>
<div class="actions"><a href="/after/07-financial-crisis-and-the-age-of-qe-2007-2019/">The crisis and QE chapter →</a><a href="/compare/">Compare monetary arrangements →</a></div></section>
</main>`;
}

export function staticTimeline(model, page) {
  const events = [];
  for (const vol of VOLUME_IDS) {
    const record = model.manifest.find(item => item.vol === vol && item.slug.includes('timeline'));
    if (!record) continue;
    const tables = (model.blocks[`${record.slug}@${vol}`] || []).filter(block => block.type === 'table');
    tables.forEach(table => {
      table.rows.forEach((row, index) => {
        const eventId = table.eventIds?.[index];
        events.push({
          id: eventId || `${vol}-${index}`,
          vol,
          sort: eventSortValue(row[0] || ''),
          year: eventYear(row[0] || ''),
          date: stripInline(row[0] || ''),
          event: stripInline(row[1] || ''),
          significance: (row[2] || '').replace(/^—$/, ''),
        });
      });
    });
  }
  const merged = mergeSharedEvents(events.map(event => ({ ...event, refs: [], sources: [event.vol] })))
    .sort((a, b) => a.sort - b.sort);
  return `<main id="main-content" class="static-article">${breadcrumbHtml(page.breadcrumbs)}
<p class="eyebrow">Connected timeline · 4600 BCE – 2026 · ${merged.length} entries</p>
<h1>${escapeHtml(DISCOVERY_COPY.timeline.title)}</h1>
<p>Trace the key moments that shaped money—from early coins and gold standards to modern currencies and Bitcoin. The timeline brings these developments together in chronological order.</p>
<ol class="static-timeline">${merged.map(event => `<li id="${escapeHtml(event.id)}"><time>${escapeHtml(event.date)}</time> <strong>${escapeHtml(event.event)}</strong>${event.significance ? ` — ${escapeHtml(stripInline(event.significance))}` : ''}</li>`).join('')}</ol>
</main>`;
}

export function siteChrome() {
  return `<header class="static-header"><a href="/">Money Research</a>
<nav aria-label="Primary"><a href="/">Start here</a><a href="/compare/">Compare</a><a href="/arc/">History</a><a href="/timeline/">Timeline</a><a href="/takeaways/">Takeaways</a><a href="/glossary/">Glossary</a><a href="/sources/">Sources</a></nav></header>`;
}

export function wrapStatic(inner) {
  return `${siteChrome()}${inner}`;
}
