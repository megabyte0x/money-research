import React from 'react';
import * as md from './md.js';
import { eventYear, eventSortValue, mergeSharedEvents } from './timeline.js';
import MoneyMechanics from './MoneyMechanics.jsx';
import { searchDocuments, searchState, searchUrl } from './search.js';
import { referenceSegments, shortTitle } from './references.js';

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
const BASE = import.meta.env.BASE_URL || '/';
// Editor-exposed props in the design file; fixed here at their defaults.
const BODY_SIZE = 17.5;
const GLOSSARY_INLINE = true;
const SELECTION_ACTIONS = true;
const VIEW_NAMES = { home: 'start here', compare: 'comparison', mechanics: 'money mechanics', methods: 'methods', arc: 'the arc', research: 'the research index', timeline: 'the master timeline', takeaways: 'the takeaways', glossary: 'the glossary', search: 'search results' };
const CHATGPT_URL = 'https://chatgpt.com/?q=';
const DEFAULT_QUESTION = 'Explain this passage: what is it claiming, and why does it matter?';
const MAX_PASSAGE = 1200;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

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
      <a href={'#/glossary/' + term.id}>Full glossary entry →</a>
      <button type="button" className="glossary-close" onClick={() => {
        setOpen(false);
        trigger.current?.focus();
      }}>Close definition</button>
    </span>
  </span>;
}

export default class App extends React.Component {
  state = { manifest: [], fileRefs: {}, blocks: {}, glossary: [], route: { view: 'home' }, query: '', searchVol: '', tlq: '', glq: '', collapsed: {}, progress: 0, copied: false, quote: null, askOpen: false, promptCopied: false, theme: null, loaded: false, headerH: 52, menuOpen: false };
  headerRef = React.createRef();

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
    this.onHash = () => {
      if (location.pathname !== '/' && location.hash.startsWith('#/')) { location.assign('/' + location.hash); return; }
      const search = searchState(location.hash);
      this.setState({ route: this.parseHash(), collapsed: {}, quote: null, menuOpen: false, query: search.query, searchVol: search.volume }, () => this.scrollToSection());
    };
    window.addEventListener('hashchange', this.onHash);
    window.addEventListener('popstate', this.onHash);
    this.onScroll = () => {
      const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; const stage = this.currentStage();
      this.setState(st => ({ progress: max > 0 ? window.scrollY / max : 0, stage: stage !== st.stage ? stage : st.stage }));
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onDown = (e) => { if (this.state.quote && !e.target.closest('[data-quote-btn]')) this.setState({ quote: null }); };
    window.addEventListener('mousedown', this.onDown);
    this.onResize = () => {
      const w = window.innerWidth; const mobile = w < 640, narrow = w < 1120;
      if (mobile !== this.state.mobile || narrow !== this.state.narrow) this.setState({ mobile, narrow });
    };
    window.addEventListener('resize', this.onResize); this.onResize();
    this.onFontResize = () => this.measureHeader();
    window.addEventListener('resize', this.onFontResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.measureHeader());
    const saved = localStorage.getItem('mr-theme'); if (saved) { document.body.dataset.theme = saved; this.setState({ theme: saved }); }
    this.load();
  }
  componentDidUpdate() { this.measureHeader(); }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHash); window.removeEventListener('popstate', this.onHash); window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('mousedown', this.onDown); window.removeEventListener('resize', this.onResize);
    window.removeEventListener('resize', this.onFontResize);
  }
  async load() {
    this.md = md;
    const response = await fetch(BASE + 'content/index.json');
    if (!response.ok) throw new Error(`Content index unavailable: ${response.status}`);
    const { manifest, blocks, fileRefs, glossary } = await response.json();
    this.byVolumeNumber = new Map(manifest.map(record => [`${record.vol}/${record.num}`, record]));
    this.glossRe = new RegExp('\\b(' + glossary.map(g => g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim()).filter(t => t.length > 3).sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
    this.glossMap = {}; glossary.forEach(g => { this.glossMap[g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim().toLowerCase()] = g; });
    const search = searchState(location.hash);
    this.setState({ manifest, blocks, fileRefs, glossary, loaded: true, route: this.parseHash(), query: search.query, searchVol: search.volume }, () => this.scrollToSection());
  }
  parseHash() {
    // #/<view>[/<section>] for the standalone views, #/<vol>/<slug>[/<section>] for a file.
    // The prototype only read a section off a third segment, which sent every jump link
    // (#/arc/arc-5, #/timeline/<era>, #/glossary/<term>) down the article branch and blanked the page.
    const direct = location.pathname.match(/^\/(gold|after|bitcoin)\/([a-z0-9-]+)\/?$/);
    if (!location.hash && direct) return { view: 'article', vol: direct[1], slug: direct[2], sec: new URLSearchParams(location.search).get('section') };
    const h = (location.hash || '#/home').split('?')[0].replace(/^#\/?/, '');
    const seg = h.split('/').filter(Boolean);
    if (['home', 'compare', 'mechanics', 'methods', 'timeline', 'glossary', 'takeaways', 'arc', 'research'].includes(seg[0])) return { view: seg[0], sec: seg[1] || null };
    if ((seg[0] || '').startsWith('search')) return { view: 'search' };
    if (seg[0] && seg[1]) return { view: 'article', vol: seg[0], slug: seg[1], sec: seg[2] || null };
    return { view: 'home' };
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
    requestAnimationFrame(() => {
      if (sec) {
        const el = document.getElementById(sec);
        const arcBand = this.state.route.view === 'arc' ? document.querySelector('.arc-band')?.parentElement?.offsetHeight || 0 : 0;
        const off = this.state.headerH + arcBand + 20;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off });
      }
      else window.scrollTo({ top: 0 });
    });
  }
  chapter(vol, slug) { return this.state.manifest.find(m => m.vol === vol && (m.slug === slug || m.aliases?.includes(slug))); }
  href(m, sec) { return '/' + m.vol + '/' + m.slug + '/' + (sec ? '?section=' + encodeURIComponent(sec) : ''); }
  short(m) { return shortTitle(m); }
  // ---- inline rendering with glossary hover + file refs
  inline(text, ctx) {
    const R = React.createElement; const toks = this.md.tokenizeInline(text); const out = []; let k = 0;
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
    toks.forEach(t => {
      if (t.t === 'text') pushText(t.v);
      else if (t.t === 'b') out.push(R('strong', { key: k++, style: { fontWeight: 600 } }, t.v));
      else if (t.t === 'i') out.push(R('em', { key: k++ }, t.v));
      else if (t.t === 'link') out.push(R('a', { key: k++, href: t.href, target: '_blank', rel: 'noopener' }, t.v));
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
      if (b.type === 'h1' && opts.skipH1 !== false) return;
      if (b.type === 'h2') {
        section = b.id; hidden = !!this.state.collapsed[b.id];
        const copied = this.state.copied === b.id;
        els.push(R('h2', { key: i, id: b.id, style: { fontWeight: 500, fontSize: 23, lineHeight: 1.25, margin: '44px 0 14px', display: 'flex', alignItems: 'baseline', gap: 12, textWrap: 'pretty' } },
          R('button', { onClick: () => this.setState(st => ({ collapsed: { ...st.collapsed, [b.id]: !st.collapsed[b.id] } })), title: hidden ? 'Expand section' : 'Collapse section', style: { fontFamily: MONO, fontSize: 12, color: 'var(--mut)', width: 14, flexShrink: 0 } }, hidden ? '+' : '−'),
          R('span', { style: { flex: 1 } }, this.inline(b.text, { ...ctx, gloss: false })),
          R('button', { onClick: () => this.copyLink(b.id), title: 'Copy link to section', style: { fontFamily: MONO, fontSize: 11, color: 'var(--mut)', opacity: copied ? 1 : .6 } }, copied ? 'copied' : '§')));
        return;
      }
      if (hidden) return;
      if (b.type === 'h3' || b.type === 'h4') { els.push(R('h3', { key: i, id: b.id, style: { fontWeight: 600, fontSize: 17, margin: '28px 0 8px' } }, b.text)); return; }
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
    const url = cur ? location.origin + this.href(cur, sec) : location.origin + '/#/' + r.view + (sec ? '/' + sec : '');
    navigator.clipboard && navigator.clipboard.writeText(url);
    this.setState({ copied: sec || 'page' }); clearTimeout(this.ct); this.ct = setTimeout(() => this.setState({ copied: false }), 1600);
  }
  static ERAS = {
    gold: [[-650, 'Before coin', 'Metal by weight: silver as the unit of account, gold as treasure and the stuff of kings. Power sits with whoever owns the scales and the mines.'], [500, 'Coin and empire', 'Lydia invents the coin; Persia, Rome and Byzantium make it imperial. Rome discovers debasement — the first inflation.'], [1500, 'The Middle Ages', 'Western Europe on silver pennies for five centuries; Islamic dinars, Mali\'s gold and the Florentine florin bring gold back.'], [1800, 'Early modern', 'American silver floods Europe; prices triple. Bimetallic ratios keep breaking, and Newton\'s mistake puts Britain on gold.'], [1900, 'The 19th century', 'Gold rushes, then the classical gold standard: a currency is a weight of gold, exchange rates are fixed, and deflation bites.'], [1972, '1900 – 1971', 'War breaks the standard; Bretton Woods makes the dollar gold\'s proxy; the proxy fails.'], [9999, 'After 1971', 'Officially just a commodity — yet the price runs from $35 to $850, falls for twenty years, and after 2022 central banks buy it back faster than at any time since the 1960s.']],
    after: [[1980, 'The 1970s', 'No anchor: two oil shocks, the Great Inflation, gold $35 → $850. Oil is priced in dollars; Volcker restores credibility with 20% rates.'], [1990, 'The 1980s', 'Debt crisis in Latin America, the managed dollar, Japan\'s bubble, and the first global bank rules.'], [2000, 'The 1990s', 'New nations and currencies, the euro, central-bank independence — and a crisis every few years from Mexico to Russia.'], [2010, 'The 2000s', 'China joins the world economy; cheap money builds a housing bubble; 2008 is the fiat era\'s 1929, answered by QE.'], [2020, 'The 2010s', 'Zero rates, eurozone crisis, Bitcoin and stablecoins; money becomes almost entirely information.'], [9999, 'The 2020s', 'Pandemic stimulus, the first serious inflation in forty years, reserves frozen — and central banks go back to gold.']],
    bitcoin: [[2014, 'Origins, 2008–2013', 'The whitepaper, genesis block, first transactions, exchanges and first failures.'], [2021, 'Exchanges and forks, 2014–2020', 'Custody failures, scaling disputes, stablecoins and the first institutional buyers.'], [2024, 'Institutions and states, 2021–2023', 'Legal-tender experiments, mining bans, contagion and the 2022 crash.'], [2026, 'ETFs and reserves, 2024–2025', 'Spot ETFs open institutional access while governments test reserves and change the rules.'], [9999, 'The 2026 drawdown', 'Price volatility, the Iran war, custody concentration and the unresolved monetary-standard question.']]
  };
  parseYear(date) {
    return eventYear(date);
  }
  rowRefs(vol, r) {
    // Only editorially reviewed event-to-section mappings may lead to a chapter.
    // All other rows link to their source timeline, never a keyword-matched passage.
    const key = `${vol}|${this.md.stripInline(r[0] || '')}|${this.md.stripInline(r[1] || '')}`;
    const reviewed = {
      'after|Mar 2003|Iraq invaded': ['after', '06', '9-11-afghanistan-and-iraq-2001-21'],
      'after|2 Jul 1997|Thai baht floats': ['after', '05', 'the-asian-financial-crisis-1997-98']
    }[key];
    if (reviewed) {
      const m = this.state.manifest.find(x => x.vol === reviewed[0] && x.num === reviewed[1]);
      const section = m && (this.state.blocks[m.slug + '@' + m.vol] || []).find(b => b.id === reviewed[2]);
      if (section) return [{ href: this.href(m, section.id), label: this.short(m) + ' · ' + this.md.stripInline(section.text) }];
    }
    const source = this.state.manifest.find(x => x.vol === vol && x.slug.includes('timeline'));
    return source ? [{ href: this.href(source), label: 'Source timeline · Vol. ' + ({ gold: 'I', after: 'II', bitcoin: 'III' }[vol]) }] : [];
  }
  timelineGroups() {
    this.refCache = this.refCache || {};
    const q = this.state.tlq.trim().toLowerCase(); const events = [];
    const big = /Varna|Hammurabi|Lydia strikes|Croesus|Darius|Alexander coins|Denarius debased|Constantine|Abd al-Malik|Charlemagne|jiaozi|Florence strikes|Mansa Musa|Potosí|Newton|Bank of England|Britain (leaves|suspends|returns|adopts|formally)|California|Germany adopts|Coinage Act|Witwatersrand|Bretton Woods|Roosevelt|Gold Pool|Nixon suspends|Smithsonian|major currencies float|Yom Kippur|Herstatt|Jamaica|Volcker|Gold peaks|Mexico announces|Plaza|Black Monday|Basel I\b|Berlin Wall|Soviet Union dissolved|Maastricht|ERM crisis|Tequila|Thai baht|Asian|Russia defaults|LTCM|euro (launched|notes)|China joins WTO|9\/11|Iraq invaded|Lehman|QE1|Bitcoin genesis|Whatever it takes|Draghi|Tether|COVID|Russia invades|CPI 9\.1|Liberation Day|GENIUS|gold \$3,000|gold peaks|record|\$5,590|Basel III/i;
    const bitcoinBig = /whitepaper|genesis block|first transaction|two pizzas|Mt\. Gox|first halving|SegWit|Bitcoin Cash|MicroStrategy|El Salvador|China bans mining|Central African Republic|Terra\/UST|FTX|spot bitcoin ETFs|fourth halving|Strategic Bitcoin Reserve|GENIUS Act|all-time high|Iran war|cycle low|Chivo majority privatised|20\.08m BTC/i;
    const onlyBig = !this.state.tlAll;
    for (const vol of ['gold', 'after', 'bitcoin']) {
      const m = this.state.manifest.find(x => x.vol === vol && x.slug.includes('timeline')); if (!m) continue;
      const tables = (this.state.blocks[m.slug + '@' + vol] || []).filter(b => b.type === 'table'); if (!tables.length) continue;
      tables.flatMap(t => t.rows).forEach((r, i) => {
        if (q && !r.join(' ').toLowerCase().includes(q)) return;
        const y = this.parseYear(r[0] || '');
        if (vol === 'bitcoin' && y > 2026) return;
        const isBig = (vol === 'bitcoin' ? bitcoinBig : big).test((r[1] || '') + ' ' + (r[2] || ''));
        if (onlyBig && !isBig && !q) return;
        const ck = vol + i; const refs = this.refCache[ck] || (this.refCache[ck] = this.rowRefs(vol, r));
        events.push({
          id: 'evt-' + vol + '-' + m.num + '-' + i, vol, year: y, sort: eventSortValue(r[0] || ''),
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
    const groups = periods.map(p => ({ id: 'period-' + p[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), vol: 'All volumes', label: p[1], gloss: p[2], rows: [] }));
    mergeSharedEvents(events).forEach(event => {
      const k = periods.findIndex(p => event.year < p[0]);
      const vol = event.vol;
      groups[k < 0 ? groups.length - 1 : k].rows.push({
        ...event, hasRefs: event.refs.length > 0, hasSig: !!event.significance,
        sourceLabel: event.sources.map(v => ({ gold: 'I · Gold', after: 'II · After Gold', bitcoin: 'III · Bitcoin' }[v])).join(' + '),
        eventEl: this.inline(event.eventText, { vol, gloss: false, usedGloss: { set: new Set() } }),
        sigEl: this.inline(event.significance, { vol, gloss: false, usedGloss: { set: new Set() } })
      });
    });
    return groups.filter(g => { g.count = g.rows.length; return g.count > 0; });
  }
  search() {
    return searchDocuments(this.state.manifest, this.state.blocks, this.state.query, this.state.searchVol).map(result => ({
      ...result, href: result.glossaryId ? '#/glossary/' + result.glossaryId : this.href(result.article, result.section),
      label: result.glossaryId ? 'Glossary · ' + result.glossaryTerm :
        ({ gold: 'Vol. I · ', after: 'Vol. II · ', bitcoin: 'Vol. III · ' }[result.article.vol]) + this.short(result.article) + (result.sectionTitle ? ' · ' + result.sectionTitle : '')
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
      navFlex: mobile ? '1 1 100%' : '0 0 auto',
      navOverflow: mobile ? 'auto' : 'visible',
      stickyTop: st.headerH + 'px',
      asideHeight: 'calc(100vh - ' + st.headerH + 'px)',
      rightDisplay: narrow ? 'none' : 'block',
      stageCols: mobile ? 'minmax(0,1fr)' : '120px minmax(0,1fr)',
      stageGap: mobile ? '10px' : '24px',
      selectDisplay: mobile ? 'none' : 'block',
      progressPct: (st.progress * 100).toFixed(1) + '%',
      query: st.query, searchVol: st.searchVol, tlq: st.tlq, glq: st.glq,
      bodyFontSize: BODY_SIZE + 'px'
    };
    vals.onQuery = e => {
      const v = e.target.value; this.setState({ query: v });
      if (v.trim()) {
        if (r.view !== 'search') {
          this.prevUrl = location.href;
          history.pushState(null, '', searchUrl(v, st.searchVol));
        } else history.replaceState(null, '', searchUrl(v, st.searchVol));
        if (r.view !== 'search') this.setState({ route: { view: 'search' } });
      } else if (r.view === 'search') location.href = this.prevUrl || '/#/home';
    };
    vals.onSearchVol = e => {
      const volume = e.target.value;
      history.pushState(null, '', searchUrl(st.query, volume));
      this.setState({ searchVol: volume });
    };
    vals.onTlq = e => this.setState({ tlq: e.target.value });
    vals.onGlq = e => this.setState({ glq: e.target.value });
    vals.toggleTheme = () => {
      const cur = document.body.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = next; localStorage.setItem('mr-theme', next); this.setState({ theme: next });
    };
    vals.themeLabel = (st.theme || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')) === 'dark' ? '☾ dark' : '☀ light';
    ['Home', 'Compare', 'Methods', 'Timeline', 'Takeaways', 'Glossary', 'Arc', 'Research'].forEach(n => vals['nav' + n] = r.view === n.toLowerCase() ? 'var(--fg)' : 'var(--mut)');
    const cur = r.view === 'article' ? this.chapter(r.vol, r.slug) : null;
    vals.allChapters = st.manifest.map(m => ({ href: this.href(m), optLabel: ({ gold: 'I·', after: 'II·', bitcoin: 'III·' }[m.vol]) + m.num + ' ' + this.short(m) }));
    vals.selectValue = cur ? this.href(cur) : '';
    vals.onSelect = e => { if (e.target.value) location.href = e.target.value; };
    vals.isHome = r.view === 'home'; vals.isCompare = r.view === 'compare'; vals.isMechanics = r.view === 'mechanics'; vals.isMethods = r.view === 'methods';
    vals.isArticle = !!cur; vals.isTimeline = r.view === 'timeline'; vals.isGlossary = r.view === 'glossary';
    vals.isTakeaways = r.view === 'takeaways'; vals.isSearch = r.view === 'search';
    vals.toc = []; vals.tocLabel = 'Contents';
    if (vals.isMechanics) {
      vals.tocLabel = 'Four transactions';
      vals.toc = [
        ['loan', '1 · Bank loan'], ['payment', '2 · Interbank payment'],
        ['bond', '3 · New government bond'], ['qe', '4 · Asset purchase'],
        ['takeaway', 'What stays distinct']
      ].map(([id, text]) => ({ text, href: '#/mechanics/mechanics-' + id, indent: '0' }));
    }
    vals.isArc = r.view === 'arc';
    if (vals.isArc) {
      const act = st.stage || 1; const A = App.ARC;
      vals.arcBand = A.map((a, index) => ({ href: '#/arc/arc-' + a.n, title: a.title, label: a.label, flex: a.flex, bg: index + 1 === act ? 'var(--fg)' : 'transparent', color: index + 1 === act ? 'var(--bg)' : 'var(--mut)' }));
      const active = A[act - 1]; vals.arcActiveAnchor = active.anchor; vals.arcActivePower = active.power;
      vals.tocLabel = 'Regimes';
      vals.toc = A.map((a, index) => ({ text: ROMAN[index] + ' · ' + a.title, href: '#/arc/arc-' + a.n, indent: '0' }));
    }
    if (cur) {
      const key = cur.slug + '@' + cur.vol; const bl = st.blocks[key] || [];
      vals.volLabel = { gold: 'Vol. I — Gold', after: 'Vol. II — After Gold', bitcoin: 'Vol. III — Bitcoin' }[cur.vol];
      vals.chapterNum = cur.num; vals.readTime = Math.max(1, Math.round(cur.words / 230)); vals.wordCount = cur.words.toLocaleString();
      vals.chapterTitle = cur.title.replace(/^\d+\s+—\s+/, '');
      vals.articleBody = R('div', null, this.blocksToEls(bl, { vol: cur.vol, usedGloss: { set: new Set() } }));
      vals.toc = bl.filter(b => b.type === 'h2' || b.type === 'h3').map(b => ({ text: this.md.stripInline(b.text), href: this.href(cur, b.id), indent: b.type === 'h3' ? '12px' : '0' }));
      vals.tocLabel = 'On this page';
      const list = st.manifest.filter(m => m.vol === cur.vol); const i = list.indexOf(cur); const prev = list[i - 1], next = list[i + 1];
      vals.hasPrev = !!prev; vals.prevHref = prev && this.href(prev); vals.prevTitle = prev && this.short(prev);
      vals.hasNext = !!next; vals.nextHref = next && this.href(next); vals.nextTitle = next && this.short(next);
      const refs = st.fileRefs[key] || [];
      vals.related = refs.filter(n => n !== cur.num).sort().map(n => list.find(m => m.num === n)).filter(Boolean).map(m => ({ num: m.num, title: this.short(m), href: this.href(m) }));
      vals.hasRelated = vals.related.length > 0;
      const allCollapsed = bl.filter(b => b.type === 'h2').every(b => st.collapsed[b.id]);
      vals.toggleAll = () => { const c = {}; if (!allCollapsed) bl.filter(b => b.type === 'h2').forEach(b => c[b.id] = true); this.setState({ collapsed: c }); };
      vals.toggleAllLabel = allCollapsed ? 'Expand all sections' : 'Collapse all sections';
      vals.copyPageLink = () => this.copyLink(null);
      vals.copyLabel = st.copied === 'page' ? 'Link copied' : 'Copy link to this file';
      vals.rawHref = BASE + cur.path.replace(/^content\//, 'content/resolved/');
    }
    vals.isResearch = r.view === 'research';
    if (vals.isResearch) {
      const questions = {};
      st.manifest.filter(m => m.num === '00').forEach(m => {
        (st.blocks[m.slug + '@' + m.vol] || []).filter(b => b.type === 'table').forEach(t => t.rows.forEach(row => {
          const f = (row[0] || '').replace(/`/g, '').replace(/\.md$/, '');
          questions[m.vol + '/' + f.slice(0, 2)] = this.md.stripInline(row[1] || '');
        }));
      });
      const mk = (vol, label, span, title, question) => ({
        id: 'vol-' + vol, label, span, title, question,
        files: st.manifest.filter(m => m.vol === vol && m.num !== '00').map(m => ({ href: this.href(m), num: m.num, mins: Math.max(1, Math.round(m.words / 230)), title: m.title.replace(/^\d+\s+—\s+/, ''), question: questions[vol + '/' + m.num] || '' }))
      });
      vals.volumes = [
        mk('gold', 'Vol. I', '4600 BCE – 1971', 'Gold: from bare metal to world money and back', 'How did a yellow metal become a major monetary standard, how did it lose that job to national currencies, and why does it still hold value when most wages and debts are not stated in it?'),
        mk('after', 'Vol. II', '1971 – 2026', 'After gold: the fiat world', 'What happened once no currency was defined as a weight of anything — the rules, wars, new currencies, technologies and shocks of the fiat half-century.'),
        mk('bitcoin', 'Vol. III', '2008 – 2026', 'Bitcoin: money without an issuer', 'What Bitcoin solved, how it is used, and whether it could become the unit of an economy.')];
      vals.tocLabel = 'Volumes';
      vals.toc = [{ text: 'I · Gold', href: '#/research/vol-gold', indent: '0' }, { text: 'II · After gold', href: '#/research/vol-after', indent: '0' }, { text: 'III · Bitcoin', href: '#/research/vol-bitcoin', indent: '0' }];
    }
    if (vals.isTimeline) {
      vals.toggleTlAll = () => this.setState(s2 => ({ tlAll: !s2.tlAll }));
      vals.tlAllLabel = st.tlAll ? 'Turning points only' : 'Show all events';
      vals.tlGroups = this.timelineGroups();
      vals.timelineCount = vals.tlGroups.reduce((n, g) => n + g.rows.length, 0);
      vals.tlCols = mobile ? '78px 20px minmax(0,1fr)' : '132px 24px minmax(0,1fr)';
      vals.tlKind = st.tlAll || st.tlq ? 'entries' : 'turning points';
      vals.tocLabel = 'Eras';
      vals.toc = vals.tlGroups.map(g => ({ text: g.label, href: '#/timeline/' + g.id, indent: '0' }));
    }
    if (vals.isGlossary) {
      const q = st.glq.trim().toLowerCase();
      const rows = st.glossary.filter(g => !q || (g.term + ' ' + g.def).toLowerCase().includes(q));
      vals.glossaryRows = rows.map(g => ({ id: g.id, term: g.term, defEl: this.inline(g.def, { vol: g.vol, gloss: false, usedGloss: { set: new Set() } }) }));
      vals.glossaryCount = st.glossary.length;
      vals.tocLabel = 'A–Z';
      const letters = [...new Set(rows.map(g => g.term[0].toUpperCase()))];
      vals.toc = letters.map(L => ({ text: L, href: '#/glossary/' + rows.find(g => g.term[0].toUpperCase() === L).id, indent: '0' }));
    }
    if (vals.isTakeaways) {
      vals.takeaways = st.manifest.filter(m => /^0[1-9]$/.test(m.num) && !/timeline|glossary|sources|rules/.test(m.slug)).map(m => {
        const bl = st.blocks[m.slug + '@' + m.vol] || [];
        const i = bl.findIndex(b => b.type === 'h2' && /takeaway/i.test(b.text));
        const body = i < 0 ? [] : bl.slice(i + 1, bl.slice(i + 1).findIndex(b => b.type === 'h2') < 0 ? undefined : i + 1 + bl.slice(i + 1).findIndex(b => b.type === 'h2'));
        return { id: 'tk-' + m.vol + '-' + m.num, href: this.href(m), label: ({ gold: 'I · ', after: 'II · ', bitcoin: 'III · ' }[m.vol]) + m.num, title: this.short(m), body: R('div', null, this.blocksToEls(body, { vol: m.vol, usedGloss: { set: new Set() } })) };
      });
      vals.tocLabel = 'Files';
      vals.toc = vals.takeaways.map(t => ({ text: t.label + ' ' + t.title, href: '#/takeaways/' + t.id, indent: '0' }));
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
        ? ({ gold: 'Vol. I — Gold', after: 'Vol. II — After Gold', bitcoin: 'Vol. III — Bitcoin' }[cur.vol]) + ', file ' + cur.num + ' — ' + cur.title.replace(/^\d+\s+—\s+/, '')
        : 'Gold → Dollar → Crypto · research notes, ' + (VIEW_NAMES[r.view] || r.view);
      const href = cur ? location.origin + this.href(cur, sec) : location.origin + '/' + location.hash;
      this.setState({ quote: { text, x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 40, label, secTitle, href }, askOpen: false, askQ: '', promptCopied: false });
    };
    return vals;
  }
  render() {
    const v = this.renderVals();
    return (
      <div style={s('min-height:100vh;display:flex;flex-direction:column')}>
        <div style={s('position:fixed;top:0;left:0;height:2px;background:var(--fg);z-index:20', { width: v.progressPct })}></div>
        <header ref={this.headerRef} style={s("position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--rule);display:flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px", { columnGap: v.headerGap, rowGap: '8px', padding: v.headerPad, height: v.headerHeight, minHeight: '52px', flexWrap: v.headerWrap })}>
          <a href="#/home" style={s('text-decoration:none;white-space:nowrap;display:flex;gap:10px;align-items:center')}>
            <span style={s('width:7px;height:7px;border:1px solid var(--fg);display:inline-block')}></span>{v.brand}
          </a>
          <select value={v.selectValue} onChange={v.onSelect} style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;background:transparent;color:var(--fg);border:1px solid var(--rule);padding:6px 8px;min-width:0", { display: v.selectDisplay, maxWidth: v.selectMax })}>
            <option value="">Files…</option>
            {v.allChapters.map(c => <option key={c.href} value={c.href}>{c.optLabel}</option>)}
          </select>
          <input type="search" placeholder="Search" value={v.query} onChange={v.onQuery} aria-label="Search all files"
            style={s('padding:6px 8px;font-size:12px;box-sizing:border-box;min-width:0;flex-shrink:1', { width: v.searchWidth })} />
          <div style={s('flex:1')}></div>
          {v.mobile && <button aria-expanded={!!this.state.menuOpen} aria-controls="main-navigation" onClick={() => this.setState(st => ({ menuOpen: !st.menuOpen }))} style={s('border:1px solid var(--rule);padding:7px 10px')}>Menu</button>}
          <nav id="main-navigation" className="nav-scroll" style={s('display:flex;color:var(--mut);white-space:nowrap;align-items:center;min-width:0', { gap: v.navGap, flex: v.navFlex, overflowX: v.navOverflow, display: v.mobile && !this.state.menuOpen ? 'none' : 'flex', flexWrap: v.mobile ? 'wrap' : 'nowrap' })}>
            <a href="#/home" style={s('text-decoration:none', { color: v.navHome })}>Start here</a>
            <a href="#/compare" style={s('text-decoration:none', { color: v.navCompare })}>Compare</a>
            <a href="#/arc" style={s('text-decoration:none', { color: v.navArc })}>History</a>
            <a href="#/research" style={s('text-decoration:none', { color: v.navResearch })}>Research</a>
            <a href="#/timeline" style={s('text-decoration:none', { color: v.navTimeline })}>Timeline</a>
            <a href="#/takeaways" style={s('text-decoration:none', { color: v.navTakeaways })}>Takeaways</a>
            <a href="#/glossary" style={s('text-decoration:none', { color: v.navGlossary })}>Glossary</a>
            <a href="#/methods" style={s('text-decoration:none', { color: v.navMethods })}>Sources</a>
            <button onClick={v.toggleTheme} title="Toggle color mode" style={s('color:var(--mut);font-size:12px')}>{v.themeLabel}</button>
          </nav>
        </header>
        <div style={s('display:grid;gap:0;flex:1', { gridTemplateColumns: v.shellCols })}>
          <main style={s('padding:40px clamp(16px,4vw,56px) 120px;max-width:820px;width:100%;box-sizing:border-box;justify-self:center;min-width:0')} onMouseUp={v.onArticleMouseUp}>

            {v.isHome && <div className="intro-page">
              <p className="eyebrow">An evidence-led guide · three research volumes</p>
              <h1>How money works—and why it changes.</h1>
              <p className="lead">Explore gold, government currencies, and Bitcoin through history, evidence, and the trade-offs between saving, paying, pricing, and settling.</p>
              <div className="actions"><a href="#/research">Start with the research →</a><a href="#/compare">Compare monetary arrangements →</a><a href="#/mechanics">How money is created →</a></div>
              <h2>Four jobs, different arrangements</h2>
              <p>A store of value carries purchasing power through time. A medium of exchange helps people pay. A unit of account is what prices and debts are written in. A settlement asset discharges an obligation between parties or institutions. One asset need not do all four jobs.</p>
              <div className="question-grid">
                <a href="/gold/08-why-the-dollar-replaced-gold/">Why did gold lose its monetary role?<small>Convertibility, crisis and the dollar network · Vol. I</small></a>
                <a href="/after/01-the-break-1971-1976/">What supports money today?<small>Institutions, bank liabilities and acceptance · Vol. II</small></a>
                <a href="/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/">What did Bitcoin solve?<small>Permissionless transfer—and its limits · Vol. III</small></a>
              </div>
              <h2>A useful comparison starts with custody</h2>
              <p>Cash is an issuer's liability, a bank balance is a claim on a bank, physical gold is an asset held somewhere, and self-custodied Bitcoin depends on control of keys. An exchange balance or stablecoin adds another issuer or custodian. <a href="#/compare">Compare the arrangements by use →</a> To see how a bank balance is created and moved, <a href="#/mechanics">follow four £100 transactions →</a></p>
              <h2>History overlaps</h2>
              <p>Classical gold convertibility was interrupted by the First World War. Interwar attempts to restore it differed from the post-1944 Bretton Woods dollar system. Since the 1970s, fiat currencies, gold reserves, bank deposits and newer digital arrangements have coexisted; Bitcoin is not an inevitable next regime.</p>
              <div className="actions"><a href="#/arc">Read the historical arc →</a><a href="#/timeline">Explore the timelines →</a></div>
              <h2>What remains unresolved</h2>
              <p>Bitcoin permits transfer without a central operator, but broad use for wages, prices and debts remains limited. Claims about adoption, comparative returns and official reserves need populations, dates and precise source locations. We are reviewing those claims and have withheld the historical arc's unverified quantitative charts.</p>
              <p className="small-note">Research edition · 13 September 2026 · <a href="#/methods">Scope, sources and corrections</a></p>
            </div>}

            {v.isCompare && <div className="intro-page">
              <p className="eyebrow">Comparison · provisional qualitative guide</p><h1>Compare arrangements, not slogans.</h1>
              <p className="lead">The custody and issuer matter as much as the asset. Pick a use—saving, everyday payment, cross-border settlement, or pricing debts—and inspect the trade-offs. This is not an asset ranking or investment advice.</p>
              <div className="comparison-wrap"><table className="comparison"><caption>Illustrative arrangements; terms vary by jurisdiction and provider. Follow the chapters for context.</caption><thead><tr><th>Arrangement</th><th>Who holds or owes it?</th><th>Useful distinction</th><th>Read further</th></tr></thead><tbody>
                <tr><th>Physical gold</th><td>Owner or chosen vault; custody must be specified</td><td>No issuer liability for the metal itself; storage, assay and payment friction remain.</td><td><a href="/gold/04-what-gives-gold-its-value/">Gold's uses</a></td></tr>
                <tr><th>Fiat cash</th><td>Central-bank liability, held by bearer</td><td>Convenient domestic payment and pricing; access and value depend on institutions.</td><td><a href="/after/01-the-break-1971-1976/">After 1971</a></td></tr>
                <tr><th>Bank deposit</th><td>Commercial-bank liability</td><td>Payment and credit services with bank, legal and deposit-protection exposure.</td><td><a href="/after/07-financial-crisis-and-the-age-of-qe-2007-2019/">Banks and QE</a></td></tr>
                <tr><th>Self-custodied Bitcoin</th><td>Key holder controls transfers</td><td>Network settlement without a central operator; key loss, fees and price risk remain.</td><td><a href="/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/">Solved and unsolved</a></td></tr>
                <tr><th>Custodial Bitcoin</th><td>Exchange or other custodian owes a balance</td><td>Provider may ease access but reintroduces custody and withdrawal risk.</td><td><a href="/bitcoin/09-supply-and-control-who-holds-bitcoin-and-who-benefits/">Control and custody</a></td></tr>
                <tr><th>Fiat-backed stablecoin</th><td>Named issuer and its reserve/custody chain</td><td>Dollar-denominated transfer; backing, redemption eligibility and law vary by token.</td><td><a href="/after/08-innovation-cards-bitcoin-stablecoins-cbdcs/">Digital arrangements</a></td></tr>
              </tbody></table></div><p className="small-note">Evidence review is in progress. No scores, universal guarantees or current market figures are implied. <a href="#/mechanics">See how deposits, reserves, bonds and QE differ →</a> <a href="#/methods">Methods and corrections →</a></p>
            </div>}

            {v.isMechanics && <MoneyMechanics />}

            {v.isMethods && <div className="intro-page">
              <p className="eyebrow">Research method · revision 13 September 2026</p><h1>Scope and sources</h1>
              <p>The library contains 44 original research documents: 13 on gold, 14 on the post-1971 monetary system and 17 on Bitcoin. This edition presents their arguments, not an independently verified dataset. Historical, legal and market claims are under editorial review; dated observations should not be read as live figures.</p>
              <p>Each volume includes its source list: <a href="/gold/12-sources/">Gold sources</a>, <a href="/after/13-sources/">After Gold sources</a>, and <a href="/bitcoin/16-sources/">Bitcoin sources</a>. Some entries still need exact document and passage locators. The comparison is a qualitative guide and the historical arc's numerical charts are withheld while their data are checked.</p>
              <p>Authorship and editorial attribution have not yet been verified for publication. To suggest a correction, <a href="https://github.com/megabyte0x/money-research/issues/new" target="_blank" rel="noopener noreferrer">open a correction issue ↗</a> with the chapter, passage and supporting source. Substantive revisions will be recorded here as the audit progresses.</p>
              <p className="small-note">Revision history: 13 September 2026 — first evidence-led entry page, qualitative comparison, and removal of automatic timeline references.</p>
            </div>}

            {v.isArticle && v.mobile && <select aria-label="Reading contents and chapters" value="" onChange={e => { if (e.target.value) location.href = e.target.value; }} style={s('width:100%;padding:10px;margin-bottom:22px;background:var(--bg);border:1px solid var(--rule)')}>
              <option value="">On this page…</option>
              {v.toc.map(t => <option key={t.href} value={t.href}>{t.text}</option>)}
              <option disabled>— Other chapters —</option>
              {v.allChapters.map(t => <option key={t.href} value={t.href}>{t.optLabel}</option>)}
            </select>}

            {v.isArticle && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px")}>
                <span>{v.volLabel}</span><span>·</span><span>File {v.chapterNum}</span><span>·</span><span>{v.readTime} min read</span><span>·</span><span>{v.wordCount} words</span>
              </div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 32px;text-wrap:pretty')}>{v.chapterTitle}</h1>
              <div className="evidence-notice" role="note">This research chapter is under editorial review. Treat dated figures, legal status and broad conclusions as claims to verify against the <a href="#/methods">source lists and method</a>, not as live data or advice.</div>
              <div style={s('line-height:1.6', { fontSize: v.bodyFontSize })}>{v.articleBody}</div>
              <div style={s('margin-top:64px;padding-top:24px;border-top:1px solid var(--rule);display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:15px')}>
                <div>{v.hasPrev && <><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>← Previous</div><a href={v.prevHref} style={s('text-decoration:none')}>{v.prevTitle}</a></>}</div>
                <div style={s('text-align:right')}>{v.hasNext && <><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Next →</div><a href={v.nextHref} style={s('text-decoration:none')}>{v.nextTitle}</a></>}</div>
              </div>
              {v.hasRelated && (
                <div style={s('margin-top:36px;font-size:15px')}>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:10px")}>Referenced in this file</div>
                  <div style={s('display:flex;flex-direction:column;gap:6px')}>
                    {v.related.map(rr => (
                      <a key={rr.href} href={rr.href} style={s('text-decoration:none;display:grid;grid-template-columns:28px 1fr;gap:8px')}>
                        <span style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);padding-top:3px")}>{rr.num}</span>
                        <span>{rr.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>}

            {v.isArc && <div className="history-arc">
              <div className="evidence-notice" role="note">This historical narrative is being reviewed. Its quantitative charts are withheld until the underlying series, definitions and source locations are verified. Read the <a href="#/methods">source method</a> or begin with the <a href="#/home">short introduction</a>.</div>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>The arc · 11 selected arrangements and turning points · c. 3000 BCE to the present</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px;text-wrap:pretty')}>Monetary arrangements overlap—and change under pressure</h1>
              <p style={s('font-size:17.5px;line-height:1.6;margin:0 0 36px;max-width:64ch;text-wrap:pretty')}>This is a selective history, not a sequence in which each form of money disappeared when the next arrived. Metal, redeemable notes, bank deposits, central-bank reserves, Bitcoin and dollar stablecoins solve different problems for different users. The interwar bridge explains why Bretton Woods was a new design, while the final digital track overlaps the fiat and reserve stories rather than replacing them. Dates and geographic scope vary by section.</p>

              <div style={s('position:sticky;z-index:5;background:var(--bg);padding:14px 0 12px;margin-bottom:40px;border-bottom:1px solid var(--rule)', { top: v.stickyTop })}>
                <div className="arc-band" style={s('display:flex;gap:2px;min-height:28px;overflow-x:auto')}>
                  {v.arcBand.map(b => (
                    <a key={b.href} href={b.href} title={b.title} className="hov-soft"
                      style={s("border:1px solid var(--fg);text-decoration:none;display:flex;align-items:center;padding:0 6px;overflow:hidden;font-family:'IBM Plex Mono',monospace;font-size:10px;white-space:nowrap;text-overflow:ellipsis", { flex: b.flex, minWidth: v.mobile ? '74px' : 0, background: b.bg, color: b.color })}>{b.label}</a>
                  ))}
                </div>
                <div style={s("display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--mut);margin-top:6px")}>
                  <span>c. 3000 BCE</span><span>1914–1944 bridge</span><span>2008 onward overlaps</span><span>2026</span>
                </div>
                <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;margin-top:10px;display:flex;gap:16px;flex-wrap:wrap")}>
                  <span style={s('color:var(--mut)')}>Anchor now:</span><span>{v.arcActiveAnchor}</span>
                  <span style={s('color:var(--mut)')}>Power:</span><span>{v.arcActivePower}</span>
                </div>
              </div>

              <div style={s('display:flex;flex-direction:column')}>

                <section data-stage={this.arcStage('arc-1')} id="arc-1" style={s('padding:8px 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>I</span>c. 3000 BCE<br />– 650 BCE
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Metal by weight: money is what the scales say</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>Silver, weighed. Mesopotamia priced grain, labour and fines in silver shekels; Hammurabi's code set penalties in weights of it. Gold was treasure, not currency.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Temples and palaces that owned the standard weights and the stockpiles. Egypt's pharaohs ran the Nubian mines as a state monopoly; “gold is as common as dust” was a boast between kings.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Trade by assay. Every payment needed a scale, a touchstone and trust in the seller's metal — slow, and useless for a soldier's wage.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Armies and markets needed a unit that could be counted rather than weighed. Whoever could certify metal in advance would own the standard.</div>
                </div>

                <section data-stage={this.arcStage('arc-2')} id="arc-2" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>II</span>650 BCE<br />– 1252 CE
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>The sovereign's stamp: coin, and the first inflation</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>A ruler's mark on a fixed weight of metal. Lydia struck electrum c. 650 BCE; Croesus split it into pure gold and pure silver at about 13.3:1 — the first bimetallic standard.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Whoever controlled the mint. Persia, Alexander, Rome, Byzantium and the Caliphate each made coinage an instrument of empire — and each discovered the mint could quietly pay for wars.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Debasement. Rome's denarius went from ~95% silver to under 5% in three centuries as emperors paid troops in thinner coin; prices followed. Byzantium's solidus held for 700 years, then broke the same way — and lost its reserve role.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Western Europe went five centuries with silver pennies only. Trade with the East and new African gold via Mali brought gold coin back — and the two metals had to be priced against each other.</div>
                </div>

                <section data-stage={this.arcStage('arc-3')} id="arc-3" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>III</span>1252<br />– 1717
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Two metals, one ratio: bimetallism and the silver flood</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>Gold and silver both legal tender at a legal ratio. Florence's florin (1252) and Venice's ducat (1284, unchanged to 1797) returned gold to the West; silver stayed the everyday money.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Whoever owned the mines and the ratio. Spain's Potosí (1545) poured American silver into Europe; Italian and later Dutch bankers turned metal into credit. Henry VIII's Great Debasement showed the crown could still cheat on silver.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>The price revolution — a century of rising prices from a flood of metal — and Gresham's law in action: whichever metal the ratio undervalued vanished from circulation. Fixed ratios kept breaking.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> In 1717 Isaac Newton, as Master of the Mint, priced the guinea too high in silver. Silver drained out of Britain and the world's leading trader slid onto gold by accident.</div>
                </div>

                <section data-stage={this.arcStage('arc-4')} id="arc-4" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>IV</span>1717<br />– 1914
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>The gold standard: a currency is a weight of gold</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>A fixed weight of gold per unit of currency, so exchange rates were fixed too: £1 = $4.8665 for a century. Notes were claims on metal; money supply grew as fast as gold was mined.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>The Bank of England and the City of London. Britain's trade dominance pulled Germany (1871–73, paid for with French indemnity gold) and then the US (“Crime of '73”, resumption 1879) onto gold.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Price stability over decades but deflation in between — 1873–96 — because gold supply could not keep up with growing economies. Debtors and farmers paid the bill; the gold rushes of 1848, 1851 and 1886 were the only relief.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>The break was not immediate replacement →</span> The First World War interrupted the international gold standard. Attempts to restore it and the Depression occupied the three decades before Bretton Woods.</div>
                </div>

                <section data-stage={this.arcStage('arc-interwar')} id="arc-interwar" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>V</span>1914<br />– 1944
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>War, attempted restoration and Depression</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What changed</div>The international gold standard broke with the First World War. Britain restored a gold-bullion standard at its pre-war parity in 1925, then suspended it after gold losses in September 1931.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Different national paths</div>The United States suspended domestic gold redemption in 1933 and redefined the dollar in gold in 1934 without restoring ordinary holders' right to redeem. These were not the same rules as Britain's 1925 system.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Why a new design</div>Depression-era exchange and trade restrictions, alongside conflicting domestic and external priorities, shaped the 1944 Bretton Woods negotiations. The post-war dollar–gold system was not a simple restart of pre-1914 convertibility.</div>
                      </div>
                      <p className="small-note">Scope: Britain and the United States illustrate different paths; other countries followed different dates and rules. <a href="/gold/07-the-gold-standard-era-1717-1971/">Read the Gold chapter →</a> Sources: <a href="https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/1968/the-exchange-equalisation-account-its-origins-and-development.pdf">Bank of England, 1968, p. 377</a>; <a href="https://www.federalreservehistory.org/essays/roosevelts-gold-program">Federal Reserve History, “Roosevelt's Gold Program”</a>; <a href="https://www.federalreservehistory.org/essays/bretton-woods-created">Federal Reserve History, “Creation of the Bretton Woods System”</a>.</p>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>The 1944 compromise →</span> A dollar redeemable in gold for foreign monetary authorities, adjustable pegs for other participating currencies, and a new IMF to help manage balance-of-payments stress.</div>
                </div>

                <section data-stage={this.arcStage('arc-5')} id="arc-5" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VI</span>1944<br />– 1971
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Bretton Woods: the dollar becomes gold's proxy</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>The dollar at $35 an ounce, convertible for foreign governments; every other currency pegged to the dollar. Central banks held Treasuries instead of gold because Treasuries paid interest and could — it seemed — be turned into gold on demand.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>The US Treasury, holder of most of the world's gold in 1944 and the only intact major economy. The IMF was built to police the pegs.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>The Triffin dilemma. The world needed dollars for reserves, so the US had to run deficits; the more dollars abroad, the less credible the gold promise. Vietnam and the Great Society pushed money supply far past what gold could cover.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>15 August 1971 →</span> Nixon suspends official dollar–gold conversion, “temporarily.” The international par-value system unravels; <a href="https://www.imf.org/external/pubs/ft/pam/pam45/pdf/chap2.pdf">the IMF's 1978 reform</a> removes gold as its common denominator, not as every official reserve or domestic policy reference.</div>
                </div>

                <section data-stage={this.arcStage('arc-6')} id="arc-6" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VII</span>1971<br />– 1982
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Floating dollars: inflation, oil shocks and policy</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>Gold redemption ended for foreign official dollar holders in 1971; major currencies floated by 1973. The dollar continued to depend on institutions, taxation and use in trade. Pricing oil in dollars did not make dollars redeemable for oil.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who set policy</div>Governments and central banks made monetary and fiscal choices while oil producers influenced energy prices. Paul Volcker's Federal Reserve tightened policy sharply from 1979; no single actor controlled every cause of inflation.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What happened</div>U.S. inflation had been rising since the mid-1960s, before the gold-window closure. The 1970s oil shocks added pressure; disinflation under Volcker came with severe economic costs. Floating exchange rates also created new demand for hedging.</div>
                      </div>
                      <p className="small-note">The chronology and multiple causal channels are reviewed in <a href="https://www.federalreservehistory.org/essays/great-inflation">Federal Reserve History, “The Great Inflation”</a>. <a href="/after/02-oil-petrodollars-and-stagflation-1973-1982/">Read the After Gold chapter →</a></p>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Volcker's lesson was institutionalised: money would be anchored not by metal but by independent central banks with inflation targets. New Zealand first (1990), the euro treaty next, almost everyone by 2000.</div>
                </div>

                <section data-stage={this.arcStage('arc-7')} id="arc-7" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VIII</span>1982<br />– 2008
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Anchored by credibility: central banks, and a crisis every decade</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Framework</div>Many central banks adopted explicit inflation goals and more independent policy structures. Bank lending was not unlimited: capital, liquidity, funding, borrower demand and regulation still constrained credit.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Central banks set policy rates, commercial banks created deposits through lending, and governments and regulators shaped the boundaries. The IMF supported some countries in crisis, under programme conditions.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Different crises exposed different weaknesses: sovereign borrowing, exchange-rate pegs, maturity and currency mismatches, leverage, and banking supervision. They cannot all be attributed to the absence of gold.</div>
                      </div>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>After 2008 →</span> Housing and credit losses spread through leveraged institutions. Central banks expanded liquidity support and bought assets; those operations were not the same as unconstrained lending to households or governments.</div>
                </div>

                <section data-stage={this.arcStage('arc-8')} id="arc-8" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>IX</span>2008<br />– 2021
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Crisis balance sheets: zero rates and asset purchases</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Mechanism</div>Central banks purchased assets with newly created reserves and supplied emergency liquidity. Reserves are balances held by banks at a central bank; they are not identical to household bank deposits or government borrowing.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Central banks chose asset purchases and lending facilities; legislatures and treasuries made fiscal decisions; commercial banks still decided which loans to make, subject to regulation and risk.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What followed</div>Low rates, public borrowing and later pandemic support interacted with supply conditions and inflation. Bitcoin and stablecoins also developed during these years, but they are distinct designs and cannot be reduced to a single response to QE.</div>
                      </div>
                      <p className="small-note">A bank loan, interbank payment, bond issue and asset purchase change different balance sheets. <a href="#/mechanics">Follow the four transactions →</a> Source: <a href="https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf">Bank of England, 2014, Figures 1–3</a>.</p>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>2022 and after →</span> Restrictions on Russia's official reserves made custody and jurisdiction more salient for reserve managers. That does not mean every reserve asset is interchangeable, or that gold held abroad is free of custody risk.</div>
                </div>

                <section data-stage={this.arcStage('arc-9')} id="arc-9" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>X</span>2022<br />– 2026
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Reserve custody, gold and the continuing dollar</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Two different measures</div>The ECB estimated gold at 27% of the value of broad official reserves, <em>including gold</em>, at end-2025. The IMF put the dollar near 57% of reported <em>foreign-exchange</em> reserves in early 2026, a measure that excludes gold. These shares cannot be subtracted or compared as parts of one pie.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What changed</div>Some central banks added gold while its dollar price rose. Valuation is therefore part of the higher measured gold share, not proof of equivalent physical buying or a single motive. Sanctions also raised questions about access to assets held in foreign jurisdictions.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What persists</div>Dollar use in trade, borrowing, settlement and foreign-exchange reserves remains substantial. Gold can diversify official reserves without serving as the unit of account for wages and contracts. Custody, liquidity and legal access matter alongside the asset's physical form.</div>
                      </div>
                      <p className="small-note">Different denominators and dates: <a href="https://www.ecb.europa.eu/press/other-publications/ire/html/ecb.ire202606.en.html">ECB, International Role of the Euro, June 2026, chart 7</a>; <a href="https://data.imf.org/Datasets/COFER">IMF COFER</a> and its <a href="https://data.imf.org/en/news/imf%20data%20brief%20july%201">first-quarter 2026 data brief</a>. <a href="/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026/">Read the After Gold chapter →</a></p>
                    </div>
                  </div>
                </section>

                <section data-stage={this.arcStage('arc-digital')} id="arc-digital" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>XI</span>2008 onward<br />overlaps IX–X
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Parallel digital paths: Bitcoin and dollar stablecoins</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Bitcoin</div>The 2008 whitepaper proposed peer-to-peer electronic cash without a central issuer. Its issuance and transfer rules can be independently checked, but actual users face price volatility, custody choices and varying access to payments. A balance at an exchange is still a claim on that intermediary.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Dollar stablecoins</div>These digital tokens usually promise redemption at a dollar value. Unlike Bitcoin, they are liabilities of issuers: users depend on reserve quality, redemption terms, custodians and payment infrastructure. Their growing transfer activity does not by itself show broad use for everyday prices or wages.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>The open test</div>Both operate alongside bank deposits and sovereign currencies. Their long-term monetary roles depend on what they can reliably do—payments, saving, pricing, credit and settlement—and on the risks users retain. Neither automatically solves every problem identified in the preceding stages.</div>
                      </div>
                      <p className="small-note">Sources: <a href="https://bitcoin.org/bitcoin.pdf">Nakamoto, “Bitcoin: A Peer-to-Peer Electronic Cash System”</a>; <a href="https://www.bis.org/publ/arpdf/ar2025e.pdf">BIS Annual Economic Report 2025, p. 85</a>; <a href="https://www.bis.org/publ/arpdf/ar2026e.pdf">BIS Annual Economic Report 2026</a>. Continue with <a href="/bitcoin/02-what-bitcoin-solved-and-what-it-did-not/">the Bitcoin design</a> and <a href="/bitcoin/13-is-bitcoin-the-answer/">the standard question</a>.</p>
                    </div>
                  </div>
                </section>

                <div style={s('padding:24px 0 0;border-top:1px solid var(--fg);display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut)")}>What stays</div>
                  <div style={s('font-size:17.5px;line-height:1.6;max-width:62ch;text-wrap:pretty')}>
                    <p style={s('margin:0 0 1em')}>Monetary history is not a ladder with one inevitable last rung. Metal, sovereign money, bank credit and digital networks coexist because users need different combinations of stable prices, accessible payments, credit, final settlement and control over custody.</p>
                    <p style={s('margin:0')}>The questions now are comparative: which arrangement works for which use, who can change its rules, and who bears the risk when a promise fails? The three research volumes examine gold, the post-1971 dollar system and Bitcoin without treating any one of them as a predetermined answer.</p>
                    <div style={s("display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;font-family:'IBM Plex Mono',monospace;font-size:12px")}>
                      <a href="#/gold/08-why-the-dollar-replaced-gold">Gold and the dollar →</a>
                      <a href="#/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026">The present reserve system →</a>
                      <a href="#/bitcoin/13-is-bitcoin-the-answer">The Bitcoin question →</a>
                      <a href="#/timeline">Full timeline →</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {v.isResearch && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Research · {this.state.manifest.length} files in three volumes · updated 13 September 2026</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px')}>The research</h1>
              <p style={s('font-size:17.5px;line-height:1.6;margin:0 0 40px;max-width:64ch;text-wrap:pretty')}>Three sets of notes, each answering one long question. Volume I traces how gold became money and lost that role. Volume II follows the fiat world after 1971. Volume III examines what Bitcoin solved, how it is used, and what would be required for it to become a monetary standard.</p>
              {v.volumes.map(vol => (
                <div key={vol.id} id={vol.id} style={s('margin-bottom:48px')}>
                  <div style={s('padding-bottom:12px;border-bottom:1px solid var(--fg);display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);line-height:1.6")}>{vol.label}<br />{vol.span}</div>
                    <div>
                      <div style={s('font-size:24px;font-weight:500;line-height:1.2')}>{vol.title}</div>
                      <div style={s('font-size:15px;color:var(--mut);margin-top:6px;line-height:1.5;text-wrap:pretty')}>{vol.question}</div>
                    </div>
                  </div>
                  {vol.files.map(f => (
                    <a key={f.href} href={f.href} className="hov-soft" style={s('padding:14px 0;border-bottom:1px solid var(--rule);text-decoration:none;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                      <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);padding-top:4px")}>{f.num} · {f.mins} min</div>
                      <div>
                        <div style={s('font-size:17px;font-weight:500;line-height:1.3')}>{f.title}</div>
                        <div style={s('font-size:14.5px;color:var(--mut);margin-top:4px;line-height:1.5;text-wrap:pretty')}>{f.question}</div>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </>}

            {v.isTimeline && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Connected timeline · 4600 BCE – 2026 · {v.timelineCount} {v.tlKind}</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px')}>A connected monetary timeline</h1>
              <p style={s('font-size:17px;line-height:1.6;color:var(--mut);margin:0 0 28px;max-width:62ch;text-wrap:pretty')}>Events from all three volumes now share one chronological view; five reviewed duplicates are combined. Composite rows and most chapter references still need editorial review. Reviewed events link to relevant sections; other events link to their source timeline.</p>
              <div style={s('display:flex;gap:12px;align-items:center;margin-bottom:8px')}>
                <input type="search" placeholder="Filter events — e.g. Lydia, Volcker, Basel, 1980" value={v.tlq} onChange={v.onTlq} style={s('flex:1;min-width:0;box-sizing:border-box;padding:9px 12px;font-size:12px')} />
                <button onClick={v.toggleTlAll} className="hov-fg-border" style={s('font-size:11px;color:var(--mut);border:1px solid var(--rule);padding:8px 12px;white-space:nowrap')}>{v.tlAllLabel}</button>
              </div>
              {v.tlGroups.map(g => (
                <div key={g.id} id={g.id} style={s('padding-top:40px')}>
                  <div style={s('display:grid;gap:0 16px;align-items:start', { gridTemplateColumns: v.tlCols })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);padding-top:6px;line-height:1.5")}>{g.vol}<br />{g.count} events</div>
                    <div style={s('display:flex;justify-content:center')}><div style={s('width:9px;height:9px;background:var(--fg);margin-top:8px')}></div></div>
                    <div style={s('border-bottom:1px solid var(--fg);padding-bottom:12px')}>
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

            {v.isGlossary && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Glossary · {v.glossaryCount} terms across three volumes</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;margin:0 0 24px')}>Glossary</h1>
              <input type="search" placeholder="Filter terms" value={v.glq} onChange={v.onGlq} style={s('width:100%;box-sizing:border-box;padding:9px 12px;font-size:12px;margin-bottom:24px')} />
              {v.glossaryRows.map(g => (
                <div key={g.id} id={g.id} style={s('display:grid;grid-template-columns:200px 1fr;gap:24px;padding:12px 0;border-top:1px solid var(--rule);font-size:16px;line-height:1.5')}>
                  <span style={s('font-weight:500')}>{g.term}</span><span>{g.defEl}</span>
                </div>
              ))}
            </>}

            {v.isTakeaways && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Skim mode · the “Key takeaways” section of every file, in reading order</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;margin:0 0 36px')}>The whole arc in key takeaways</h1>
              {v.takeaways.map(t => (
                <div key={t.id} id={t.id} style={s('padding:24px 0;border-top:1px solid var(--rule)')}>
                  <a href={t.href} style={s('text-decoration:none;display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:baseline;margin-bottom:10px')}>
                    <span style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut)")}>{t.label}</span>
                    <span style={s('font-size:20px;font-weight:500;line-height:1.25')}>{t.title}</span>
                  </a>
                  <div style={s('font-size:16px;line-height:1.6')}>{t.body}</div>
                </div>
              ))}
            </>}

            {v.isSearch && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>{v.searchSummary}</div>
              <label className="search-filter">Volume <select aria-label="Filter search by volume" value={v.searchVol} onChange={v.onSearchVol}>
                <option value="">All volumes</option><option value="gold">I · Gold</option><option value="after">II · After Gold</option><option value="bitcoin">III · Bitcoin</option>
              </select></label>
              {v.query.trim().length >= 2 && v.searchResults.length === 0 && <p className="search-empty">No matching sections in {v.searchVol ? 'this volume' : 'the library'}. Try another term or choose All volumes. <a href="#/research">Browse the research →</a></p>}
              {v.searchResults.map((sr, i) => (
                <a key={sr.href + i} href={sr.href} style={s('display:block;text-decoration:none;padding:16px 0;border-top:1px solid var(--rule)')}>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>{sr.label}{sr.matches > 1 ? ' · ' + sr.matches + ' matching passages' : ''}</div>
                  <div style={s('font-size:15px;line-height:1.55')}>{sr.snippet.before}{sr.snippet.match && <mark style={{ background: 'var(--mark)', color: 'inherit' }}>{sr.snippet.match}</mark>}{sr.snippet.after}</div>
                </a>
              ))}
            </>}
          </main>

          <aside style={s("border-left:1px solid var(--rule);position:sticky;overflow-y:auto;padding:28px 24px 40px 20px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;line-height:1.5", { display: v.rightDisplay, top: v.stickyTop, height: v.asideHeight })}>
            <div style={s('color:var(--mut);margin-bottom:12px')}>{v.tocLabel}</div>
            <div style={s('display:flex;flex-direction:column;gap:6px')}>
              {v.toc.map((t, i) => (
                <a key={t.href + i} href={t.href} className="hov-fg" style={s('text-decoration:none;color:var(--mut);display:block', { paddingLeft: t.indent })}>{t.text}</a>
              ))}
            </div>
            {v.isArticle && (
              <div style={s('margin-top:28px;padding-top:16px;border-top:1px solid var(--rule);display:flex;flex-direction:column;gap:8px;color:var(--mut)')}>
                <button onClick={v.toggleAll} className="hov-fg" style={s('text-align:left;color:var(--mut);font-size:11.5px')}>{v.toggleAllLabel}</button>
                <button onClick={v.copyPageLink} className="hov-fg" style={s('text-align:left;color:var(--mut);font-size:11.5px')}>{v.copyLabel}</button>
                <a href={v.rawHref} target="_blank" rel="noopener" className="hov-fg" style={s('text-decoration:none;color:var(--mut)')}>View source .md ↗</a>
              </div>
            )}
          </aside>
        </div>
        {this.renderSelection()}
      </div>
    );
  }
}
