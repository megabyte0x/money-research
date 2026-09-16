import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import * as md from './md.js';
import { eventYear, eventSortValue, mergeSharedEvents, SHARED_EVENT_PAIRS } from './timeline.js';
import { TIMELINE_SECTION_REFS } from './timeline-references.js';
import MoneyMechanics from './MoneyMechanics.jsx';
import Comparison from './features/comparison/Comparison.jsx';
import { SearchView, GlossaryView, SourcesView, SynthesisView } from './features/discovery/DiscoveryViews.jsx';
import { approvedSummaryCatalog } from './features/discovery/catalog.js';
import { contentRole } from './features/discovery/catalog.js';
import { HomePage, MethodsPage, ArticlePage } from './features/reader/ReaderViews.jsx';
import HistoryView from './features/reader/HistoryView.jsx';
import { searchDocuments, searchState, searchUrl } from './search.js';
import { referenceSegments, shortTitle } from './references.js';
import { articleHref, parseLocation, sharedViewForRecord, translateLegacyHash, viewPath, VOLUME_IDS } from './routes.js';
import { applyClientMeta, resolvePage } from './seo.js';
import { SITE } from './site-config.js';
import { loadRoutePayload } from './content-load.js';
import { HISTORY_STAGES } from './history-stages.js';

// The prototype declared every rule as an inline CSS string. Keeping those strings
// verbatim and parsing them once keeps the port pixel-identical to the design file.
const styleCache = new Map();
function S(css) {
  let o = styleCache.get(css);
  if (o) return o;
  o = {};
  css.split(';').forEach(decl => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    const k = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!k) return;
    o[k.startsWith('--') ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  });
  styleCache.set(css, o);
  return o;
}
const s = (css, extra) => (extra ? { ...S(css), ...extra } : S(css));

const MONO = "'IBM Plex Mono',monospace";
// Editor-exposed props in the design file; fixed here at their defaults.
const BODY_SIZE = 17.5;
const GLOSSARY_INLINE = true;
const SELECTION_ACTIONS = true;
const VIEW_NAMES = { home: 'start here', compare: 'comparison', mechanics: 'money mechanics', methods: 'methods', sources: 'sources and further reading', arc: 'the arc', timeline: 'the master timeline', takeaways: 'the takeaways', glossary: 'the glossary', search: 'search results' };
const CHATGPT_URL = 'https://chatgpt.com/?q=';
const DEFAULT_QUESTION = 'Explain this passage: what is it claiming, and why does it matter?';
const MAX_PASSAGE = 1200;

function GlossaryTerm({ term, label, definition }) {
  const [open, setOpen] = React.useState(false);
  const [alignment, setAlignment] = React.useState('left');
  const id = React.useId();
  const container = React.useRef(null);
  const trigger = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!container.current?.contains(event.target)) setOpen(false); };
    const closeEscape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [open]);

  return <span className="glossary-term" ref={container} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button type="button" ref={trigger} className="glossary-trigger" aria-label={`Define ${label}`}
      aria-expanded={open} aria-controls={id} onClick={event => {
        setAlignment(event.currentTarget.getBoundingClientRect().left < window.innerWidth / 2 ? 'left' : 'right');
        setOpen(value => !value);
      }}>{label}</button>
    <span id={id} role="group" aria-label={`${term.term} definition`}
      className={`glossary-panel glossary-panel-${alignment}`} hidden={!open}>
      <strong>{term.term}</strong><span>{definition}</span>
      <a href={'/glossary/#' + term.id}>Full glossary entry →</a>
    </span>
  </span>;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const initial = props.initialData || {};
    const search = typeof location !== 'undefined' ? searchState(location.search || location.hash) : { query: '', volume: '' };
    this.state = {
      manifest: initial.manifest || [], fileRefs: initial.fileRefs || {}, blocks: initial.blocks || {},
      glossary: initial.glossary || [], timelineReviewStatus: initial.timelineReviewStatus || {},
      comparisonCells: initial.comparisonCells || {}, observations: initial.observations || {},
      articleEvidence: initial.articleEvidence || {}, articleClaims: initial.articleClaims || {},
      articleMetadata: initial.articleMetadata || {}, claims: initial.claims || {}, sources: initial.sources || {},
      searchIndexLoaded: !!initial.searchIndexLoaded, discoveryLoaded: !!initial.discoveryLoaded,
      route: props.initialRoute || { view: 'home' }, query: search.query, searchVol: search.volume,
      glq: '', collapsed: {}, progress: 0, copied: false, quote: null, askOpen: false,
      promptCopied: false, theme: null, loaded: !!initial.manifest?.length, headerH: 52, menuOpen: false,
    };
    if (initial.manifest?.length) this.prepareCorpus(initial);
  }
  headerRef = React.createRef();
  menuButtonRef = React.createRef();
  stageObserver = null;

  // The header is one 52px row on desktop and wraps to two rows on a phone; every
  // sticky offset (band, aside, anchor scrolling) is measured off it rather than fixed.
  measureHeader() {
    const h = this.headerRef.current && this.headerRef.current.offsetHeight;
    if (h && h !== this.state.headerH) {
      this.setState({ headerH: h });
      document.documentElement.style.scrollPaddingTop = (h + 20) + 'px';
    }
  }

  componentDidMount() {
    this.onHash = () => { this.onNavigate(); };
    window.addEventListener('hashchange', this.onHash);
    window.addEventListener('popstate', this.onHash);
    this.onScroll = () => {
      if (this.scrollTick) return;
      this.scrollTick = requestAnimationFrame(() => {
        this.scrollTick = 0;
        const h = document.documentElement; const max = h.scrollHeight - h.clientHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        this.setState(st => st.progress === progress ? null : { progress });
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onDown = (e) => { if (this.state.quote && !e.target.closest('[data-quote-btn]')) this.setState({ quote: null }); };
    window.addEventListener('mousedown', this.onDown);
    this.onMenuEscape = (e) => {
      if (e.key === 'Escape' && this.state.mobile && this.state.menuOpen) {
        this.setState({ menuOpen: false }, () => this.menuButtonRef.current?.focus());
      }
    };
    document.addEventListener('keydown', this.onMenuEscape);
    this.onResize = () => {
      const w = window.innerWidth; const mobile = w < 640, narrow = w < 1120;
      if (mobile !== this.state.mobile || narrow !== this.state.narrow) this.setState({ mobile, narrow });
    };
    window.addEventListener('resize', this.onResize); this.onResize();
    this.onFontResize = () => this.measureHeader();
    window.addEventListener('resize', this.onFontResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.measureHeader());
    const saved = localStorage.getItem('mr-theme'); if (saved) { document.body.dataset.theme = saved; this.setState({ theme: saved }); }
    this.observeStages();
    this.applySeo();
    if (!this.state.loaded) this.load();
    else this.scrollToSection();
  }
  componentDidUpdate(prevProps, prevState) {
    this.measureHeader();
    if (prevState.route !== this.state.route || prevState.loaded !== this.state.loaded) {
      this.observeStages();
      this.applySeo();
    }
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHash); window.removeEventListener('popstate', this.onHash); window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('mousedown', this.onDown); window.removeEventListener('resize', this.onResize);
    window.removeEventListener('resize', this.onFontResize);
    document.removeEventListener('keydown', this.onMenuEscape);
    this.stageObserver?.disconnect();
    if (this.scrollTick) cancelAnimationFrame(this.scrollTick);
  }
  prepareCorpus(data) {
    this.md = md;
    this.byVolumeNumber = new Map((data.manifest || []).map(record => [`${record.vol}/${record.num}`, record]));
    const glossary = data.glossary || [];
    const terms = glossary.map(g => g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim()).filter(t => t.length > 3)
      .sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.glossRe = terms.length ? new RegExp('\\b(' + terms.join('|') + ')\\b', 'i') : null;
    this.glossMap = {};
    glossary.forEach(g => { this.glossMap[g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim().toLowerCase()] = g; });
  }
  async load() {
    const { loadShell } = await import('./content-load.js');
    const shell = await loadShell();
    this.prepareCorpus(shell);
    translateLegacyHash(location, history, shell.manifest);
    const route = parseLocation(location, shell.manifest);
    const extra = await loadRoutePayload(route, shell);
    const search = searchState(location.search || location.hash);
    this.setState({ ...shell, ...extra, loaded: true, route, query: search.query, searchVol: search.volume }, () => this.scrollToSection());
  }
  async onNavigate() {
    translateLegacyHash(location, history, this.state.manifest);
    const route = parseLocation(location, this.state.manifest);
    const search = searchState(location.search || location.hash);
    const extra = await loadRoutePayload(route, this.state);
    this.setState({ route, ...extra, collapsed: {}, quote: null, menuOpen: false, query: search.query, searchVol: search.volume }, () => this.scrollToSection());
  }
  pageFromRoute(route = this.state.route) {
    if (route.view === 'home') return resolvePage({ kind: 'home' });
    if (route.view === 'hub') return resolvePage({ kind: 'hub', vol: route.vol });
    if (route.view === 'article') {
      const record = this.chapter(route.vol, route.slug);
      return record ? resolvePage({ kind: 'chapter', record, articleMetadata: this.state.articleMetadata }) : resolvePage({ kind: 'error' });
    }
    if (route.view === 'notfound') return resolvePage({ kind: 'error' });
    return resolvePage({ kind: route.view });
  }
  applySeo() {
    if (!this.state.loaded) return;
    applyClientMeta(this.pageFromRoute());
  }
  observeStages() {
    this.stageObserver?.disconnect();
    if (this.state.route.view !== 'arc' || typeof IntersectionObserver === 'undefined') return;
    this.stageObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      const stage = +visible.target.dataset.stage;
      this.setState(st => st.stage === stage ? null : { stage });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('[data-stage]').forEach(el => this.stageObserver.observe(el));
  }
  // ---- Arc: regimes
  static ARC = [
    { n: 1, label: 'Weight', title: 'Metal by weight', flex: 10, anchor: 'Silver by weight, in the Near East', power: 'Temples and palaces' },
    { n: 2, label: 'Coin', title: "The sovereign's stamp", flex: 12, anchor: "Ruler's stamp on metal", power: 'Whoever held the mint' },
    { n: 3, label: 'Bimetal', title: 'Bimetallism', flex: 9, anchor: 'Gold and silver at a legal ratio', power: 'Mints, merchants and bankers' },
    { n: 4, label: 'Gold std', title: 'The classical gold standard', flex: 9, anchor: 'Gold convertibility in participating countries', power: 'Governments and central banks' },
    { n: 'interwar', label: 'Interwar', title: 'War, return and Depression', flex: 9, anchor: 'Contested gold parities, then suspensions', power: 'National governments and central banks' },
    { n: 5, label: 'BW', title: 'Bretton Woods', flex: 7, anchor: 'Dollar–gold convertibility for foreign officials', power: 'US Treasury and participating states' },
    { n: 6, label: 'Float', title: 'Floating dollars and inflation', flex: 7, anchor: 'Policy and institutions, not oil redemption', power: 'Governments, central banks and markets' },
    { n: 7, label: 'Credibility', title: 'Central-bank credibility', flex: 9, anchor: 'Policy frameworks and financial regulation', power: 'Central banks, banks and regulators' },
    { n: 8, label: 'QE', title: 'Crisis balance sheets', flex: 7, anchor: 'Central-bank reserves and bank credit are distinct', power: 'Central banks, governments and banks' },
    { n: 9, label: 'Reserves', title: 'Reserve custody and the dollar', flex: 8, anchor: 'Dollar networks alongside gold reserves', power: 'Issuers, custodians and reserve managers' },
    { n: 'digital', label: 'Digital', title: 'Bitcoin and dollar stablecoins', flex: 10, anchor: 'Bitcoin issuance rules; stablecoin issuer claims', power: 'Key holders, networks, issuers and custodians' }];

  arcStage(id) {
    const index = App.ARC.findIndex(stage => `arc-${stage.n}` === id);
    if (index < 0) throw new Error(`Unknown arc stage: ${id}`);
    return index + 1;
  }

  currentStage() {
    if (this.state.route.view !== 'arc') return 0;
    const els = [...document.querySelectorAll('[data-stage]')]; let act = 1; const mid = window.innerHeight * 0.4;
    els.forEach(el => { if (el.getBoundingClientRect().top <= mid) act = +el.dataset.stage; });
    return act;
  }
  scrollToSection() {
    const sec = this.state.route.sec;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      if (sec) {
        const el = document.getElementById(decodeURIComponent(sec));
        const progressBar = this.state.route.view === 'arc' ? document.querySelector('.reader-history-progress')?.offsetHeight || 0 : 0;
        const off = this.state.headerH + progressBar + 20;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: reduced ? 'auto' : 'smooth' });
      }
      else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'auto' });
    });
  }
  chapter(vol, slug) { return this.state.manifest.find(m => m.vol === vol && (m.slug === slug || m.aliases?.includes(slug))); }
  href(m, sec) { return articleHref(m, sec); }
  short(m) { return shortTitle(m); }
  // ---- inline rendering with glossary hover + file refs
  inline(text, ctx) {
    const R = React.createElement; const toks = this.md.tokenizeInline(text, { linkifyUrls: ctx.sourcePage === true }); const out = []; let k = 0;
    const gloss = ctx.gloss !== false && GLOSSARY_INLINE;
    const pushText = (str) => {
      const parts = ctx.vol ? referenceSegments(str, ctx.vol, this.byVolumeNumber) : [{ type: 'text', text: str }];
      parts.forEach(part => {
        if (part.type === 'ref') {
          out.push(R('a', { key: k++, href: this.href(part.record), title: `${part.record.vol.toUpperCase()} · file ${part.record.num}`, style: { textDecorationColor: 'var(--mut)' } }, part.text));
          return;
        }
        const value = part.text;
        if (gloss && this.glossRe && !ctx.usedGloss.done) {
          const m = value.match(this.glossRe);
          if (m) {
            const g = this.glossMap[m[1].toLowerCase()];
            if (g && !ctx.usedGloss.set.has(g.id)) {
              ctx.usedGloss.set.add(g.id);
              out.push(value.slice(0, m.index)); out.push(this.term(g, m[1], k++)); pushText(value.slice(m.index + m[1].length)); return;
            }
          }
        }
        out.push(value);
      });
    };
    toks.forEach((t, index) => {
      if (t.t === 'text') {
        const previous = toks[index - 1];
        const next = toks[index + 1];
        const betweenCitations = previous?.t === 'link' && next?.t === 'link' &&
          this.md.sourceCitation(previous.v, previous.href.trim()) && this.md.sourceCitation(next.v, next.href.trim()) &&
          /^\s*,\s*$/.test(t.v);
        pushText(betweenCitations ? ' ' : t.v);
      }
      else if (t.t === 'b') out.push(R('strong', { key: k++, style: { fontWeight: 600 } }, t.v));
      else if (t.t === 'i') out.push(R('em', { key: k++ }, t.v));
      else if (t.t === 'link') {
        const href = t.href.trim();
        const label = t.auto ? this.md.sourceUrlLabel(href) : t.v;
        const citation = this.md.sourceCitation(t.v, href);
        if (citation && this.md.isSafeContentHref(href)) {
          out.push(R('sup', { key: k++, className: 'source-citation' },
            R('a', { href, 'aria-label': `Source ${citation.sourceId}`, title: `Source ${citation.sourceId} — view entry in Sources` }, `[${citation.number}]`)));
        } else {
          out.push(this.md.isSafeContentHref(href)
            ? R('a', { key: k++, href, ...(href.startsWith('/') || href.startsWith('#/') ? {} : { target: '_blank', rel: 'noopener' }), className: t.auto ? 'source-url' : undefined, title: t.auto ? href : undefined }, label) : label);
        }
      }
      else if (t.t === 'code') {
        const m = this.state.manifest.find(x => t.v.replace(/\.md$/, '').startsWith(x.slug.slice(0, 20)) && x.vol === ctx.vol);
        out.push(m ? R('a', { key: k++, href: this.href(m), style: { fontFamily: MONO, fontSize: '0.85em' } }, t.v) : R('code', { key: k++, style: { fontFamily: MONO, fontSize: '0.85em' } }, t.v));
      }
    });
    return out;
  }
  term(g, label, key) {
    return React.createElement(GlossaryTerm, { key, term: g, label, definition: this.md.stripInline(g.def) });
  }
  // ---- block rendering
  blocksToEls(blocks, ctx, opts = {}) {
    const R = React.createElement; const els = []; let section = null; let hidden = false;
    const c = () => ({ ...ctx, usedGloss: { set: ctx.usedGloss.set, done: false } });
    blocks.forEach((b, i) => {
      const blockId = b.id ? `${opts.idPrefix || ''}${b.id}` : null;
      if (b.type === 'h1' && opts.skipH1 !== false) return;
      if (b.type === 'h2') {
        section = blockId; hidden = !!this.state.collapsed[blockId];
        const copied = this.state.copied === blockId;
        if (!opts.idPrefix) for (const [oldId, newId] of Object.entries(ctx.sectionAliases || {})) {
          if (newId === b.id) els.push(R('span', { key: `alias-${i}-${oldId}`, id: oldId, 'aria-hidden': true, className: 'section-alias' }));
        }
        els.push(R('h2', { key: i, id: blockId, style: { fontWeight: 500, fontSize: 23, lineHeight: 1.25, margin: '44px 0 14px', display: 'flex', alignItems: 'baseline', gap: 12, textWrap: 'pretty' } },
          R('button', { type: 'button', 'aria-expanded': !hidden, 'aria-label': hidden ? 'Expand section' : 'Collapse section', onClick: () => this.setState(st => ({ collapsed: { ...st.collapsed, [blockId]: !st.collapsed[blockId] } })), title: hidden ? 'Expand section' : 'Collapse section', style: { fontFamily: MONO, fontSize: 12, color: 'var(--mut)', width: 14, flexShrink: 0 } }, hidden ? '+' : '−'),
          R('span', { style: { flex: 1 } }, this.inline(b.text, { ...ctx, gloss: false })),
          R('button', { type: 'button', 'aria-label': 'Copy link to section', onClick: () => this.copyLink(blockId), title: 'Copy link to section', style: { fontFamily: MONO, fontSize: 11, color: 'var(--mut)', opacity: copied ? 1 : .6 } }, copied ? 'copied' : '§')));
        return;
      }
      if (hidden) return;
      if (b.type === 'h3' || b.type === 'h4') { els.push(R(b.type, { key: i, id: blockId, style: { fontWeight: 600, fontSize: b.type === 'h4' ? 16 : 17, margin: '28px 0 8px' } }, b.text)); return; }
      if (b.type === 'p') { els.push(R('p', { key: i, style: { margin: '0 0 1.1em', textWrap: 'pretty' } }, this.inline(b.text, c()))); return; }
      if (b.type === 'quote') { els.push(R('blockquote', { key: i, style: { margin: '0 0 1.1em', padding: '0 0 0 18px', borderLeft: '1px solid var(--fg)', fontStyle: 'italic' } }, this.inline(b.text, c()))); return; }
      if (b.type === 'ul' || b.type === 'ol') { els.push(R(b.type, { key: i, style: { margin: '0 0 1.1em', paddingLeft: 22 } }, b.items.map((it, j) => R('li', { key: j, style: { marginBottom: 6 } }, this.inline(it, c()))))); return; }
      if (b.type === 'hr') { els.push(R('hr', { key: i, style: { border: 0, borderTop: '1px solid var(--rule)', margin: '32px 0' } })); return; }
      if (b.type === 'table') {
        els.push(R('div', { key: i, style: { overflowX: 'auto', margin: '8px 0 1.6em' } }, R('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 14.5, lineHeight: 1.45 } },
          R('thead', null, R('tr', null, b.header.map((h, j) => R('th', { key: j, style: { textAlign: 'left', fontFamily: MONO, fontSize: 11, fontWeight: 500, color: 'var(--mut)', padding: '6px 10px 6px 0', borderBottom: '1px solid var(--fg)', verticalAlign: 'bottom' } }, this.md.stripInline(h))))),
          R('tbody', null, b.rows.map((r, j) => R('tr', { key: j }, r.map((cell, q) => R('td', { key: q, style: { padding: '8px 12px 8px 0', borderBottom: '1px solid var(--rule)', verticalAlign: 'top' } }, this.inline(cell, { ...ctx, gloss: false })))))))));
      }
    });
    return els;
  }
  copyLink(sec) {
    const r = this.state.route;
    const cur = r.view === 'article' && this.chapter(r.vol, r.slug);
    const url = cur ? SITE.origin + this.href(cur, sec) : SITE.origin + viewPath(r.view, sec);
    navigator.clipboard && navigator.clipboard.writeText(url);
    this.setState({ copied: sec || 'page' }); clearTimeout(this.ct); this.ct = setTimeout(() => this.setState({ copied: false }), 1600);
  }
  parseYear(date) {
    return eventYear(date);
  }
  rowRefs(vol, eventId) {
    // Only editorially reviewed event-to-section mappings may lead to a chapter.
    // All other rows link to their source timeline, never a keyword-matched passage.
    const status = this.state.timelineReviewStatus[eventId];
    const reviewed = TIMELINE_SECTION_REFS[eventId];
    if (reviewed) {
      const m = this.state.manifest.find(x => x.vol === reviewed[0] && x.num === reviewed[1]);
      const section = m && (this.state.blocks[m.slug + '@' + m.vol] || []).find(b => b.id === reviewed[2]);
      if (section) return [{ href: this.href(m, section.id), label: 'Checked chapter section · ' + this.short(m) + ' · ' + this.md.stripInline(section.text) }];
    }
    const source = this.state.manifest.find(x => x.vol === vol && x.slug.includes('timeline'));
    return source ? [{ href: this.href(source), label: (status === 'source_timeline_fallback_reviewed' ? 'Reviewed source fallback' : 'Destination review pending') + ' · Source timeline · Vol. ' + ({ gold: 'I', after: 'II', bitcoin: 'III', zcash: 'IV' }[vol]) }] : [];
  }
  timelineGroups() {
    this.refCache = this.refCache || {};
    const events = [];
    const big = /Varna|Hammurabi|Lydia strikes|Croesus|Darius|Alexander coins|Denarius debased|Constantine|Abd al-Malik|Charlemagne|jiaozi|Florence strikes|Mansa Musa|Potosí|Newton|Bank of England|Britain (leaves|suspends|returns|adopts|formally)|California|Germany adopts|Coinage Act|Witwatersrand|Bretton Woods|Roosevelt|Gold Pool|Nixon suspends|Smithsonian|major currencies float|Yom Kippur|Herstatt|Jamaica|Volcker|Gold peaks|Mexico announces|Plaza|Black Monday|Basel I\b|Berlin Wall|Soviet Union dissolved|Maastricht|ERM crisis|Tequila|Thai baht|Asian|Russia defaults|LTCM|euro (launched|notes)|China joins WTO|9\/11|Iraq invaded|Lehman|QE1|Bitcoin genesis|Whatever it takes|Draghi|Tether|COVID|Russia invades|CPI 9\.1|Liberation Day|GENIUS|gold \$3,000|gold peaks|record|\$5,590|Basel III|Zerocash|Zcash launch|Sapling|Orchard|NU6\.[123]|Ironwood/i;
    const bitcoinBig = /whitepaper|genesis block|first transaction|two pizzas|Mt\. Gox|first halving|SegWit|Bitcoin Cash|MicroStrategy|El Salvador|China bans mining|Central African Republic|Terra\/UST|FTX|spot bitcoin ETFs|fourth halving|Strategic Bitcoin Reserve|GENIUS Act|all-time high|Iran war|cycle low|Chivo majority privatised|20\.08m BTC/i;
    const onlyBig = !this.state.tlAll;
    for (const vol of VOLUME_IDS) {
      const m = this.state.manifest.find(x => x.vol === vol && x.slug.includes('timeline')); if (!m) continue;
      const tables = (this.state.blocks[m.slug + '@' + vol] || []).filter(b => b.type === 'table' && /^date$/i.test(this.md.stripInline(b.header?.[0] || ''))); if (!tables.length) continue;
      tables.flatMap(t => t.rows.map((row, index) => ({ row, eventId: t.eventIds[index] }))).forEach(({ row: r, eventId }) => {
        const y = this.parseYear(r[0] || '');
        if (vol === 'bitcoin' && y > 2026) return;
        const isBig = (vol === 'bitcoin' ? bitcoinBig : big).test((r[1] || '') + ' ' + (r[2] || ''));
        if (onlyBig && !isBig) return;
        const refs = this.refCache[eventId] || (this.refCache[eventId] = this.rowRefs(vol, eventId));
        events.push({
          id: eventId, vol, year: y, sort: eventSortValue(r[0] || ''),
          refs, date: this.md.stripInline(r[0] || ''), eventText: this.md.stripInline(r[1] || ''), significance: (r[2] || '').replace(/^—$/, ''),
          size: isBig ? '20px' : '15.5px', weight: isBig ? 500 : 400, pad: isBig ? '18px' : '11px', dot: isBig ? '11px' : '7px',
          dotBg: isBig ? 'var(--fg)' : 'var(--bg)', dotTop: isBig ? '22px' : '17px', dateColor: isBig ? 'var(--fg)' : 'var(--mut)'
        });
      });
    }
    const periods = [
      [1, 'Before 1 CE', 'Ancient monetary arrangements; dates are approximate where the source says so.'],
      [1500, '1–1499', 'Coins, credit and regional monetary systems.'],
      [1900, '1500–1899', 'Trade, banking and the classical gold standard.'],
      [1945, '1900–1944', 'War and interwar monetary experiments.'],
      [1971, '1945–1970', 'The Bretton Woods dollar system.'],
      [1990, '1971–1989', 'Floating currencies, inflation and financial change.'],
      [2008, '1990–2007', 'Globalisation and emerging-market crises.'],
      [2020, '2008–2019', 'Financial crisis, QE and Bitcoin’s first decade.'],
      [9999, '2020–2026', 'Pandemic, sanctions and overlapping digital arrangements.']
    ];
    const groups = periods.map(p => ({ id: 'period-' + p[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: p[1], gloss: p[2], rows: [] }));
    mergeSharedEvents(events).forEach(event => {
      const k = periods.findIndex(p => event.year < p[0]);
      const vol = event.vol;
      groups[k < 0 ? groups.length - 1 : k].rows.push({
        ...event, hasRefs: event.refs.length > 0, hasSig: !!event.significance,
        sourceLabel: event.sources.map(v => ({ gold: 'I · Gold', after: 'II · After Gold', bitcoin: 'III · Bitcoin', zcash: 'IV · Zcash' }[v])).join(' + '),
        eventEl: this.inline(event.eventText, { vol, gloss: false, usedGloss: { set: new Set() } }),
        sigEl: this.inline(event.significance, { vol, gloss: false, usedGloss: { set: new Set() } })
      });
    });
    return groups.filter(g => g.rows.length > 0);
  }
  search() {
    return searchDocuments(this.state.manifest, this.state.blocks, this.state.query, this.state.searchVol).map(result => ({
      ...result, href: result.glossaryId ? '/glossary/#' + result.glossaryId : this.href(result.article, result.section),
      label: result.glossaryId ? 'Glossary · ' + result.glossaryTerm :
        ({ gold: 'Vol. I · ', after: 'Vol. II · ', bitcoin: 'Vol. III · ', zcash: 'Vol. IV · ' }[result.article.vol]) + this.short(result.article) + (result.sectionTitle ? ' · ' + result.sectionTitle : '')
    }));
  }
  // ---- selection → ask ChatGPT
  askPrompt() {
    const q = this.state.quote; if (!q) return '';
    const question = this.state.askQ.trim() || DEFAULT_QUESTION;
    const passage = q.text.length > MAX_PASSAGE ? q.text.slice(0, MAX_PASSAGE - 1) + '…' : q.text;
    return [question, '', 'Passage from ' + q.label + (q.secTitle ? ', section “' + q.secTitle + '”' : '') + ':',
      '```', passage, '```', '', 'Source: ' + q.href].join('\n');
  }
  openInChatGPT() {
    window.open(CHATGPT_URL + encodeURIComponent(this.askPrompt()), '_blank', 'noopener');
    this.setState({ quote: null, askOpen: false, askQ: '' });
  }
  copyPrompt() {
    if (navigator.clipboard) navigator.clipboard.writeText(this.askPrompt());
    this.setState({ promptCopied: true });
    clearTimeout(this.pt); this.pt = setTimeout(() => this.setState({ promptCopied: false }), 1600);
  }
  renderSelection() {
    const q = this.state.quote; if (!q) return null;
    const open = this.state.askOpen;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const halfW = open ? Math.min(190, vw / 2 - 12) : 110;
    const left = Math.min(Math.max(q.x, halfW + 8), vw - halfW - 8);
    const box = { position: 'absolute', left, top: q.y, transform: 'translateX(-50%)', zIndex: 40, fontFamily: MONO, fontSize: 11 };
    const xUrl = 'https://twitter.com/intent/tweet?text=' +
      encodeURIComponent('“' + (q.text.length > 220 ? q.text.slice(0, 217) + '…' : q.text) + '”') + '&url=' + encodeURIComponent(q.href);

    if (!open) {
      return (
        <div data-quote-btn="1" style={{ ...box, display: 'flex', gap: 1 }}>
          <button onClick={() => this.setState({ askOpen: true })}
            style={s('background:var(--fg);color:var(--bg);padding:6px 10px;white-space:nowrap;font-size:11px')}>Ask ChatGPT ↗</button>
          <a href={xUrl} target="_blank" rel="noopener"
            style={s('background:var(--fg);color:var(--bg);padding:6px 10px;white-space:nowrap;text-decoration:none;font-size:11px')}>Post on X ↗</a>
        </div>
      );
    }
    return (
      <div data-quote-btn="1" style={{ ...box, width: halfW * 2, maxWidth: 'calc(100vw - 16px)', background: 'var(--bg)', border: '1px solid var(--fg)', boxShadow: '0 8px 24px rgba(0,0,0,.14)' }}>
        <div style={s('display:flex;align-items:baseline;gap:8px;padding:10px 12px 0')}>
          <span style={s('color:var(--mut);flex:1')}>Ask ChatGPT about this passage</span>
          <button onClick={() => this.setState({ quote: null, askOpen: false })} title="Close" style={s('color:var(--mut);font-size:12px')}>×</button>
        </div>
        <div style={s("padding:8px 12px 0;font-family:'Newsreader',Georgia,serif;font-size:13.5px;line-height:1.45;color:var(--mut);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden")}>“{q.text}”</div>
        <div style={s('padding:10px 12px 12px')}>
          <input autoFocus value={this.state.askQ} placeholder="What do you want to know?"
            onChange={e => this.setState({ askQ: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') this.openInChatGPT(); if (e.key === 'Escape') this.setState({ quote: null, askOpen: false }); }}
            style={s('width:100%;box-sizing:border-box;padding:8px 10px;font-size:12px')} />
          <div style={s('display:flex;gap:8px;align-items:center;margin-top:8px')}>
            <button onClick={() => this.openInChatGPT()}
              style={s('background:var(--fg);color:var(--bg);padding:7px 10px;font-size:11px;white-space:nowrap')}>Open in ChatGPT ↗</button>
            <button onClick={() => this.copyPrompt()} className="hov-fg-border"
              style={s('color:var(--mut);border:1px solid var(--rule);padding:6px 10px;font-size:11px;white-space:nowrap')}>{this.state.promptCopied ? 'Copied' : 'Copy prompt'}</button>
            <div style={s('flex:1')}></div>
            <a href={xUrl} target="_blank" rel="noopener" className="hov-fg" style={s('color:var(--mut);font-size:11px;white-space:nowrap')}>Post on X ↗</a>
          </div>
          <div style={s('color:var(--mut);margin-top:8px;line-height:1.45')}>Opens ChatGPT in a new tab with the passage and its source link, answered on your own plan. Empty question → “{DEFAULT_QUESTION.split(':')[0]}…”</div>
        </div>
      </div>
    );
  }
  renderVals() {
    const st = this.state, r = st.route, R = React.createElement;
    const mobile = !!st.mobile, narrow = !!st.narrow;
    const vals = {
      mobile,
      shellCols: narrow ? 'minmax(0,1fr)' : 'minmax(0,1fr) 210px',
      brand: 'Money Research',
      selectMax: mobile ? '96px' : '180px',
      navGap: narrow ? '12px' : '18px',
      headerGap: mobile ? '10px' : narrow ? '14px' : '24px',
      searchWidth: mobile ? '104px' : narrow ? '150px' : '210px',
      headerWrap: mobile ? 'wrap' : 'nowrap',
      headerHeight: mobile ? 'auto' : '52px',
      headerPad: mobile ? '8px 16px' : '0 24px',
      navFlex: mobile ? '1 1 100%' : narrow ? '1 1 0' : '0 0 auto',
      navOverflow: narrow ? 'auto' : 'visible',
      stickyTop: st.headerH + 'px',
      asideHeight: 'calc(100vh - ' + st.headerH + 'px)',
      rightDisplay: narrow ? 'none' : 'block',
      stageCols: mobile ? 'minmax(0,1fr)' : '120px minmax(0,1fr)',
      stageGap: mobile ? '10px' : '24px',
      selectDisplay: mobile ? 'none' : 'block',
      progressPct: (st.progress * 100).toFixed(1) + '%',
      query: st.query, searchVol: st.searchVol, glq: st.glq,
      bodyFontSize: BODY_SIZE + 'px'
    };
    vals.onQuery = e => {
      const v = e.target.value; this.setState({ query: v });
      if (v.trim()) {
        if (r.view !== 'search') {
          this.prevUrl = location.href;
          history.pushState(null, '', searchUrl(v, st.searchVol));
        } else history.replaceState(null, '', searchUrl(v, st.searchVol));
        if (r.view !== 'search') {
          this.setState({ route: { view: 'search' } }, () => this.onNavigate());
        }
      } else if (r.view === 'search') location.href = this.prevUrl || '/';
    };
    vals.onSearchVol = e => {
      const volume = e.target.value;
      history.pushState(null, '', searchUrl(st.query, volume));
      this.setState({ searchVol: volume });
    };
    vals.onGlq = e => this.setState({ glq: e.target.value });
    vals.toggleTheme = () => {
      const cur = document.body.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = next; localStorage.setItem('mr-theme', next); this.setState({ theme: next });
    };
    vals.themeLabel = (st.theme || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')) === 'dark' ? '☾ dark' : '☀ light';
    ['Home', 'Compare', 'Methods', 'Sources', 'Timeline', 'Takeaways', 'Glossary', 'Arc'].forEach(n => vals['nav' + n] = r.view === n.toLowerCase() ? 'var(--fg)' : 'var(--mut)');
    const cur = r.view === 'article' || r.view === 'hub' ? this.chapter(r.vol, r.slug || '00-readme') : null;
    const homeNames = { gold: ['Vol. I · Gold', 'How did a metal become money and what role remains?'], after: ['Vol. II · After Gold', 'What changed when official gold conversion ended?'], bitcoin: ['Vol. III · Bitcoin', 'What did Bitcoin solve and what remains unsettled?'], zcash: ['Vol. IV · Zcash', 'What can private ZEC payments do, and what remains unproven?'] };
    vals.homeVolumes = VOLUME_IDS.map(vol => {
      const directory = st.manifest.find(item => item.id === `${vol}-00`);
      return directory && { id: vol, label: homeNames[vol][0], href: this.href(directory),
        title: vol === 'after' ? 'After Gold' : vol === 'gold' ? 'Gold' : vol === 'bitcoin' ? 'Bitcoin' : 'Zcash',
        question: homeNames[vol][1] };
    }).filter(Boolean);
    vals.allChapters = st.manifest.filter(m => !sharedViewForRecord(m)).map(m => ({ href: this.href(m), optLabel: ({ gold: 'I·', after: 'II·', bitcoin: 'III·', zcash: 'IV·' }[m.vol]) + m.num + ' ' + this.short(m) }));
    vals.selectValue = cur ? this.href(cur) : '';
    vals.onSelect = e => { if (e.target.value) location.href = e.target.value; };
    vals.isHome = r.view === 'home'; vals.isCompare = r.view === 'compare'; vals.isMechanics = r.view === 'mechanics'; vals.isMethods = r.view === 'methods';
    const compareParams = new URLSearchParams(location.search);
    vals.compareUse = compareParams.get('use') || r.compareUse || 'saving';
    vals.comparePerspective = compareParams.get('perspective') || r.comparePerspective || 'household';
    vals.comparisonClaims = st.claims;
    vals.comparisonSources = st.sources;
    vals.comparisonCells = st.comparisonCells;
    vals.onCompareUse = e => { history.pushState(null, '', '/compare/?use=' + encodeURIComponent(e.target.value) + '&perspective=' + encodeURIComponent(vals.comparePerspective)); this.onNavigate(); };
    vals.onComparePerspective = e => { history.pushState(null, '', '/compare/?use=' + encodeURIComponent(vals.compareUse) + '&perspective=' + encodeURIComponent(e.target.value)); this.onNavigate(); };
    vals.isNotFound = r.view === 'notfound';
    vals.isArticle = !!cur; vals.isTimeline = r.view === 'timeline'; vals.isGlossary = r.view === 'glossary'; vals.isSources = r.view === 'sources';
    vals.isTakeaways = r.view === 'takeaways'; vals.isSearch = r.view === 'search';
    vals.toc = []; vals.tocLabel = 'Contents';
    if (vals.isMechanics) {
      vals.tocLabel = 'Four transactions';
      vals.toc = [
        ['loan', '1 · Bank loan'], ['payment', '2 · Interbank payment'],
        ['bond', '3 · New government bond'], ['qe', '4 · Asset purchase'],
        ['takeaway', 'What stays distinct']
      ].map(([id, text]) => ({ text, href: '/mechanics/#mechanics-' + id, indent: '0' }));
    }
    vals.isArc = r.view === 'arc';
    if (vals.isArc) {
      const act = st.stage || 1; const A = App.ARC;
      vals.arcStage = act;
      vals.arcBand = HISTORY_STAGES.map((a, index) => ({ href: '/arc/#' + a.id, title: a.title, complete: index + 1 <= act }));
      const active = A[act - 1]; vals.arcActiveAnchor = active.anchor; vals.arcActivePower = active.power;
      vals.tocLabel = 'Regimes';
      vals.toc = A.map((a, index) => ({ text: `${index + 1} · ${a.title}`, href: '/arc/#arc-' + a.n, indent: '0' }));
    }
    if (cur) {
      const key = cur.slug + '@' + cur.vol; const bl = st.blocks[key] || [];
      vals.volLabel = { gold: 'Vol. I — Gold', after: 'Vol. II — After Gold', bitcoin: 'Vol. III — Bitcoin', zcash: 'Vol. IV — Zcash' }[cur.vol];
      vals.chapterNum = cur.num; vals.readTime = Math.max(1, Math.round(cur.words / 230)); vals.wordCount = cur.words.toLocaleString();
      vals.chapterTitle = cur.title.replace(/^\d+\s+—\s+/, '');
      vals.articleIsReference = contentRole(cur) !== 'topic';
      const metadata = st.articleMetadata[cur.id];
      vals.articleSummary = metadata?.summary || null;
      vals.hubChapters = r.view === 'hub' ? st.manifest.filter(item => item.vol === cur.vol && item.slug !== '00-readme' && !sharedViewForRecord(item)).map(item => ({ href: this.href(item), title: this.short(item) })) : [];
      vals.articleBody = R('div', null, this.blocksToEls(bl, { vol: cur.vol, usedGloss: { set: new Set() }, sectionAliases: cur.sectionAliases, sourcePage: ['gold-12', 'after-13', 'bitcoin-16', 'zcash-17'].includes(cur.id) }));
      vals.toc = bl.filter(b => b.type === 'h2' || b.type === 'h3').map(b => ({ text: this.md.stripInline(b.text), href: this.href(cur, b.id), indent: b.type === 'h3' ? '12px' : '0' }));
      vals.tocLabel = 'On this page';
      const list = st.manifest.filter(m => m.vol === cur.vol && !sharedViewForRecord(m)); const i = list.indexOf(cur); const prev = list[i - 1], next = list[i + 1];
      vals.hasPrev = !!prev; vals.prevHref = prev && this.href(prev); vals.prevTitle = prev && this.short(prev);
      vals.hasNext = !!next; vals.nextHref = next && this.href(next); vals.nextTitle = next && this.short(next);
    }
    if (vals.isTimeline) {
      vals.toggleTlAll = () => this.setState(s2 => ({ tlAll: !s2.tlAll }));
      vals.tlAllLabel = st.tlAll ? 'Turning points only' : 'Show all events';
      vals.tlGroups = this.timelineGroups();
      vals.timelineCount = vals.tlGroups.reduce((n, g) => n + g.rows.length, 0);
      vals.tlCols = mobile ? '78px 20px minmax(0,1fr)' : '132px 24px minmax(0,1fr)';
      vals.tlKind = st.tlAll ? 'entries' : 'turning points';
      vals.tocLabel = 'Eras';
      vals.toc = vals.tlGroups.map(g => ({ text: g.label, href: '/timeline/#' + g.id, indent: '0' }));
    }
    if (vals.isGlossary) {
      const q = st.glq.trim().toLowerCase();
      const rows = st.glossary.filter(g => !q || (g.term + ' ' + g.def).toLowerCase().includes(q));
      vals.glossaryRows = rows.map(g => ({
        id: g.id, term: g.term, review: g.review,
        defEl: this.inline(g.def, { vol: g.vol, gloss: false, usedGloss: { set: new Set() } }),
        exampleEl: g.review === 'accepted' && g.example ? this.inline(g.example, { vol: g.vol, gloss: false, usedGloss: { set: new Set() } }) : null,
        relatedLinks: g.review === 'accepted' ? (g.related || []).map(id => {
          const target = st.glossary.find(term => term.id === id);
          return target ? { id, label: target.term, href: '/glossary/#' + id } : null;
        }).filter(Boolean) : [],
        chapterLinks: g.review === 'accepted' ? (g.chapters || []).map(id => {
          const article = st.manifest.find(record => record.id === id);
          return article ? { id, label: this.short(article), href: this.href(article) } : null;
        }).filter(Boolean) : []
      }));
      vals.glossaryCount = st.glossary.length;
      vals.tocLabel = 'A–Z';
      const letters = [...new Set(rows.map(g => g.term[0].toUpperCase()))];
      vals.toc = letters.map(L => ({ text: L, href: '/glossary/#' + rows.find(g => g.term[0].toUpperCase() === L).id, indent: '0' }));
    }
    if (vals.isSources) {
      const labels = { gold: 'Volume I · Gold', after: 'Volume II · After Gold', bitcoin: 'Volume III · Bitcoin', zcash: 'Volume IV · Zcash' };
      const sourceRecords = st.manifest.filter(record => sharedViewForRecord(record) === 'sources');
      vals.sourceVolumes = sourceRecords.map(record => {
        const blocks = st.blocks[`${record.slug}@${record.vol}`] || [];
        return {
          id: `sources-${record.vol}`,
          label: labels[record.vol],
          body: R('div', null, this.blocksToEls(blocks, {
            vol: record.vol,
            usedGloss: { set: new Set() },
            sectionAliases: record.sectionAliases,
            sourcePage: true,
          }, { idPrefix: `sources-${record.vol}-` })),
        };
      });
      vals.tocLabel = 'Volumes and sections';
      vals.toc = sourceRecords.flatMap(record => {
        const prefix = `sources-${record.vol}-`;
        const blocks = st.blocks[`${record.slug}@${record.vol}`] || [];
        return [
          { text: labels[record.vol], href: `/sources/#sources-${record.vol}`, indent: '0' },
          ...blocks.filter(block => block.type === 'h2' || block.type === 'h3').map(block => ({
            text: this.md.stripInline(block.text),
            href: `/sources/#${prefix}${block.id}`,
            indent: block.type === 'h3' ? '24px' : '12px',
          })),
        ];
      });
    }
    if (vals.isTakeaways) {
      const summaryParams = new URLSearchParams(location.search);
      vals.summaryRows = approvedSummaryCatalog(st.manifest, st.articleMetadata).map(row => ({ ...row, href: this.href(row.article), citations: row.summary?.citations || st.articleMetadata[row.id]?.citations || [] }));
      vals.summaryVolume = summaryParams.get('vol') || '';
      vals.summaryTopic = summaryParams.get('topic') || '';
      vals.onSummaryVolume = e => { history.pushState(null, '', '/takeaways/?vol=' + encodeURIComponent(e.target.value) + '&topic=' + encodeURIComponent(vals.summaryTopic)); this.onNavigate(); };
      vals.onSummaryTopic = e => { history.pushState(null, '', '/takeaways/?vol=' + encodeURIComponent(vals.summaryVolume) + '&topic=' + encodeURIComponent(e.target.value)); this.onNavigate(); };
      vals.tocLabel = 'Short answers';
    }
    if (vals.isSearch) {
      vals.searchResults = this.search();
      vals.searchSummary = st.query.trim().length < 2 ? 'Type at least two characters' : vals.searchResults.length + ' sections match “' + st.query.trim() + '”';
      vals.tocLabel = 'Search'; vals.toc = [];
    }
    vals.onArticleMouseUp = () => {
      if (!SELECTION_ACTIONS) return;
      const sel = window.getSelection(); const text = sel && sel.toString().trim();
      if (!text || text.length < 12) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      // remember where the passage came from, so the question carries its own citation
      let sec = null;
      document.querySelectorAll('main h2[id]').forEach(h => { if (h.getBoundingClientRect().top <= rect.top + 1) sec = h.id; });
      const secEl = sec && document.getElementById(sec);
      const secTitle = secEl ? secEl.innerText.replace(/^[−+]\s*/, '').replace(/\s*(§|copied)\s*$/, '').trim() : null;
      const label = cur
        ? ({ gold: 'Vol. I — Gold', after: 'Vol. II — After Gold', bitcoin: 'Vol. III — Bitcoin', zcash: 'Vol. IV — Zcash' }[cur.vol]) + ', file ' + cur.num + ' — ' + cur.title.replace(/^\d+\s+—\s+/, '')
        : 'Gold → Dollar → Crypto · research notes, ' + (VIEW_NAMES[r.view] || r.view);
      const href = cur ? location.origin + this.href(cur, sec) : location.origin + viewPath(r.view, sec);
      this.setState({ quote: { text, x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 40, label, secTitle, href }, askOpen: false, askQ: '', promptCopied: false });
    };
    vals.showContents = vals.toc.length > 0 || vals.isArticle;
    if (!vals.showContents) {
      vals.shellCols = 'minmax(0,1fr)';
      vals.rightDisplay = 'none';
    }
    return vals;
  }
  render() {
    const v = this.renderVals();
    return (
      <div style={s('min-height:100vh;display:flex;flex-direction:column')}>
        <div style={s('position:fixed;top:0;left:0;height:2px;background:var(--fg);z-index:20', { width: v.progressPct })}></div>
        <header ref={this.headerRef} style={s("position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--rule);display:flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px", { columnGap: v.headerGap, rowGap: '8px', padding: v.headerPad, height: v.headerHeight, minHeight: '52px', flexWrap: v.headerWrap })}>
          <a href="/" style={s('text-decoration:none;white-space:nowrap;display:flex;gap:10px;align-items:center')}>
            <span style={s('width:7px;height:7px;border:1px solid var(--fg);display:inline-block')}></span>{v.brand}
          </a>
          <select value={v.selectValue} onChange={v.onSelect} style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;background:transparent;color:var(--fg);border:1px solid var(--rule);padding:6px 8px;min-width:0", { display: v.selectDisplay, maxWidth: v.selectMax })}>
            <option value="">Files…</option>
            {v.allChapters.map(c => <option key={c.href} value={c.href}>{c.optLabel}</option>)}
          </select>
          <input type="search" placeholder="Search" value={v.query} onChange={v.onQuery} aria-label="Search all files"
            style={s('padding:6px 8px;font-size:12px;box-sizing:border-box;min-width:0;flex-shrink:1', { width: v.searchWidth })} />
          <div style={s('flex:1')}></div>
          {v.mobile && <button ref={this.menuButtonRef} aria-expanded={!!this.state.menuOpen} aria-controls="main-navigation" onClick={() => this.setState(st => ({ menuOpen: !st.menuOpen }))} style={s('border:1px solid var(--rule);padding:7px 10px')}>Menu</button>}
          <nav id="main-navigation" className="nav-scroll" style={s('display:flex;color:var(--mut);white-space:nowrap;align-items:center;min-width:0', { gap: v.navGap, flex: v.navFlex, overflowX: v.navOverflow, display: v.mobile && !this.state.menuOpen ? 'none' : 'flex', flexWrap: v.mobile ? 'wrap' : 'nowrap' })}>
            <a href="/" style={s('text-decoration:none', { color: v.navHome })}>Start here</a>
            <a href="/compare/" style={s('text-decoration:none', { color: v.navCompare })}>Compare</a>
            <a href="/arc/" style={s('text-decoration:none', { color: v.navArc })}>History</a>
            <a href="/timeline/" style={s('text-decoration:none', { color: v.navTimeline })}>Timeline</a>
            <a href="/takeaways/" style={s('text-decoration:none', { color: v.navTakeaways })}>Takeaways</a>
            <a href="/glossary/" style={s('text-decoration:none', { color: v.navGlossary })}>Glossary</a>
            <a href="/sources/" style={s('text-decoration:none', { color: v.navSources })}>Sources</a>
            <button type="button" onClick={v.toggleTheme} title="Toggle color mode" aria-label="Toggle color mode" style={s('color:var(--mut);font-size:12px')}>{v.themeLabel}</button>
          </nav>
        </header>
        <div style={s('display:grid;gap:0;flex:1', { gridTemplateColumns: v.shellCols })}>
          <main id="main-content" style={s('padding:40px clamp(16px,4vw,56px) 120px;max-width:820px;width:100%;box-sizing:border-box;justify-self:center;min-width:0')} onMouseUp={v.onArticleMouseUp}>

            {v.isNotFound && <div className="intro-page"><h1>Page not found</h1><p>This address is not a published Money Research page.</p><nav className="reader-actions"><a href="/">Money Research home →</a></nav></div>}

            {v.isHome && <HomePage v={v} />}

            {v.isCompare && <Comparison v={v} />}

            {v.isMechanics && <MoneyMechanics />}

            {v.isMethods && <MethodsPage v={v} />}

            {v.isArticle && <ArticlePage v={v} />}

            {v.isArc && <HistoryView v={v} />}


            {v.isTimeline && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Connected timeline · 4600 BCE – 2026 · {v.timelineCount} {v.tlKind}</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px')}>A connected monetary timeline</h1>
              <p style={s('font-size:17px;line-height:1.6;color:var(--mut);margin:0 0 28px;max-width:62ch;text-wrap:pretty')}>Trace the key moments that shaped money—from early coins and gold standards to modern currencies and Bitcoin. The timeline brings these developments together in chronological order.</p>
              <div style={s('display:flex;align-items:center;margin-bottom:8px')}>
                <button onClick={v.toggleTlAll} className="hov-fg-border" style={s('font-size:11px;color:var(--mut);border:1px solid var(--rule);padding:8px 12px;white-space:nowrap')}>{v.tlAllLabel}</button>
              </div>
              {v.tlGroups.map(g => (
                <div key={g.id} id={g.id} style={s('padding-top:40px')}>
                  <div style={s('display:grid;gap:0 16px;align-items:start', { gridTemplateColumns: v.tlCols })}>
                    <div style={s('display:flex;justify-content:center', { gridColumn: '2' })}><div style={s('width:9px;height:9px;background:var(--fg);margin-top:8px')}></div></div>
                    <div style={s('border-bottom:1px solid var(--fg);padding-bottom:12px', { gridColumn: '3' })}>
                      <div style={s('font-size:24px;font-weight:500;line-height:1.2')}>{g.label}</div>
                      <div style={s('font-size:15px;color:var(--mut);line-height:1.5;margin-top:6px;text-wrap:pretty')}>{g.gloss}</div>
                    </div>
                  </div>
                  {g.rows.map(rw => (
                    <div key={rw.id} id={rw.id} style={s('display:grid;gap:0 16px;align-items:stretch', { gridTemplateColumns: v.tlCols })}>
                      <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;text-align:right;line-height:1.4", { color: rw.dateColor, padding: rw.pad + ' 0 0' })}>{rw.date}</div>
                      <div style={s('display:flex;justify-content:center;position:relative')}>
                        <div style={s('position:absolute;top:0;bottom:0;width:1px;background:var(--rule)')}></div>
                        <div style={s('position:relative;border-radius:50%;border:1px solid var(--fg)', { width: rw.dot, height: rw.dot, background: rw.dotBg, marginTop: rw.dotTop })}></div>
                      </div>
                      <div style={s('border-bottom:1px solid var(--rule)', { padding: rw.pad + ' 0 ' + rw.pad })}>
                        <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:5px")}>{rw.sourceLabel}</div>
                        <div style={s('line-height:1.35;text-wrap:pretty', { fontSize: rw.size, fontWeight: rw.weight })}>{rw.eventEl}</div>
                        {rw.hasSig && <div style={s('font-size:14px;color:var(--mut);line-height:1.5;margin-top:4px')}>{rw.sigEl}</div>}
                        {rw.hasRefs && (
                          <div style={s("display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-family:'IBM Plex Mono',monospace;font-size:11px")}>
                            {rw.refs.map(x => <a key={x.href + x.label} href={x.href} className="hov-fg" style={s('color:var(--mut);text-decoration-color:var(--rule)')}>→ {x.label}</a>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>}

            {v.isGlossary && <GlossaryView v={v} />}

            {v.isSources && <SourcesView v={v} />}

            {v.isTakeaways && <SynthesisView v={v} />}

            {v.isSearch && <SearchView v={v} />}

          </main>

          <aside style={s("border-left:1px solid var(--rule);position:sticky;overflow-y:auto;padding:28px 24px 40px 20px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;line-height:1.5", { display: v.rightDisplay, top: v.stickyTop, height: v.asideHeight })}>
            <div style={s('color:var(--mut);margin-bottom:12px')}>{v.tocLabel}</div>
            <div style={s('display:flex;flex-direction:column;gap:6px')}>
              {v.toc.map((t, i) => (
                <a key={t.href + i} href={t.href} className="hov-fg" style={s('text-decoration:none;color:var(--mut);display:block', { paddingLeft: t.indent })}>{t.text}</a>
              ))}
            </div>
          </aside>
        </div>
        {this.renderSelection()}
        <Analytics />
      </div>
    );
  }
}
