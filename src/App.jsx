import React from 'react';
import * as md from './md.js';

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
const GLOSSARY_HOVER = true;
const SELECTION_ACTIONS = true;
const VIEW_NAMES = { arc: 'the arc', research: 'the research index', timeline: 'the master timeline', takeaways: 'the takeaways', glossary: 'the glossary', search: 'search results' };
const CHATGPT_URL = 'https://chatgpt.com/?q=';
const DEFAULT_QUESTION = 'Explain this passage: what is it claiming, and why does it matter?';
const MAX_PASSAGE = 1200;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

export default class App extends React.Component {
  state = { manifest: [], docs: {}, blocks: {}, glossary: [], route: { view: 'arc' }, query: '', tlq: '', glq: '', collapsed: {}, hoverTerm: null, progress: 0, copied: false, quote: null, askOpen: false, askQ: '', promptCopied: false, theme: null, loaded: false, headerH: 52 };
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
    this.onHash = () => this.setState({ route: this.parseHash(), collapsed: {}, quote: null }, () => this.scrollToSection());
    window.addEventListener('hashchange', this.onHash);
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
    window.removeEventListener('hashchange', this.onHash); window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('mousedown', this.onDown); window.removeEventListener('resize', this.onResize);
    window.removeEventListener('resize', this.onFontResize);
  }
  async load() {
    this.md = md;
    const manifest = await (await fetch(BASE + 'content/manifest.json')).json();
    const texts = await Promise.all(manifest.map(m => fetch(BASE + m.path).then(r => r.text())));
    const docs = {}, blocks = {}; let glossary = [];
    manifest.forEach((m, i) => {
      docs[m.slug + '@' + m.vol] = texts[i];
      blocks[m.slug + '@' + m.vol] = this.md.parseMd(texts[i]);
      if (m.slug.includes('glossary')) glossary = glossary.concat(this.md.parseGlossary(texts[i]).map(g => ({ ...g, vol: m.vol })));
    });
    const seen = new Set();
    glossary = glossary.filter(g => { const k = g.term.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.term.localeCompare(b.term));
    this.glossRe = new RegExp('\\b(' + glossary.map(g => g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim()).filter(t => t.length > 3).sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
    this.glossMap = {}; glossary.forEach(g => { this.glossMap[g.term.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim().toLowerCase()] = g; });
    this.setState({ manifest, docs, blocks, glossary, loaded: true, route: this.parseHash() }, () => this.scrollToSection());
  }
  parseHash() {
    // #/<view>[/<section>] for the standalone views, #/<vol>/<slug>[/<section>] for a file.
    // The prototype only read a section off a third segment, which sent every jump link
    // (#/arc/arc-5, #/timeline/<era>, #/glossary/<term>) down the article branch and blanked the page.
    const h = (location.hash || '#/arc').replace(/^#\/?/, '');
    const seg = h.split('/').filter(Boolean);
    if (['timeline', 'glossary', 'takeaways', 'arc', 'research'].includes(seg[0])) return { view: seg[0], sec: seg[1] || null };
    if ((seg[0] || '').startsWith('search')) return { view: 'search' };
    if (seg[0] && seg[1]) return { view: 'article', vol: seg[0], slug: seg[1], sec: seg[2] || null };
    return { view: 'arc' };
  }
  // ---- Arc: regimes + charts
  static ARC = [
    { n: 1, label: 'Weight', title: 'Metal by weight', flex: 10, anchor: 'Silver, by weight', power: 'Temples and palaces' },
    { n: 2, label: 'Coin', title: "The sovereign's stamp", flex: 12, anchor: "Ruler's stamp on metal", power: 'Whoever held the mint' },
    { n: 3, label: 'Bimetal', title: 'Bimetallism', flex: 9, anchor: 'Gold and silver at a legal ratio', power: 'Mine-owners and bankers' },
    { n: 4, label: 'Gold std', title: 'The gold standard', flex: 9, anchor: 'A fixed weight of gold', power: 'Bank of England, the City' },
    { n: 5, label: 'BW', title: 'Bretton Woods', flex: 6, anchor: 'Dollar at $35/oz', power: 'US Treasury' },
    { n: 6, label: 'Oil', title: 'No anchor; oil', flex: 6, anchor: 'Oil priced in dollars', power: 'OPEC, US Treasury, Volcker' },
    { n: 7, label: 'Credibility', title: 'Central-bank credibility', flex: 9, anchor: 'Inflation targets', power: 'Independent central banks, IMF' },
    { n: 8, label: 'QE', title: 'Money at will', flex: 6, anchor: "Central bank's balance sheet", power: 'Central banks as buyer of last resort' },
    { n: 9, label: '→ Gold', title: 'Weaponised dollar, return to gold', flex: 5, anchor: 'Dollar for pricing; gold for reserves', power: 'Sanctions — and geology' }];

  svg(w, h, children, extra = {}) {
    return React.createElement('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', style: { display: 'block', border: '1px solid var(--rule)', padding: 12, boxSizing: 'border-box', background: 'transparent', ...extra }, fontFamily: MONO, fontSize: 10 }, ...children);
  }
  lineChart(series, opts) {
    const R = React.createElement; const W = 640, H = opts.h || 200, L = 44, Rr = 16, T = 14, B = 26;
    const xs = series.flatMap(sr => sr.d.map(p => p[0])), ys = series.flatMap(sr => sr.d.map(p => p[1]));
    const x0 = opts.x0 ?? Math.min(...xs), x1 = opts.x1 ?? Math.max(...xs); const log = !!opts.log;
    const ymin = opts.y0 ?? (log ? Math.min(...ys) : Math.min(0, ...ys)), ymax = opts.y1 ?? Math.max(...ys) * 1.05;
    const X = x => L + (x - x0) / (x1 - x0) * (W - L - Rr);
    const Y = y => log ? T + (1 - (Math.log10(y) - Math.log10(ymin)) / (Math.log10(ymax) - Math.log10(ymin))) * (H - T - B) : T + (1 - (y - ymin) / (ymax - ymin)) * (H - T - B);
    const ticks = opts.yticks || []; const xt = opts.xticks || [];
    const kids = [];
    ticks.forEach(t => {
      kids.push(R('line', { key: 'g' + t, x1: L, x2: W - Rr, y1: Y(t), y2: Y(t), stroke: 'var(--rule)', strokeDasharray: '2 3' }));
      kids.push(R('text', { key: 'gt' + t, x: L - 6, y: Y(t) + 3, textAnchor: 'end', fill: 'var(--mut)' }, opts.fmt ? opts.fmt(t) : t));
    });
    xt.forEach(t => kids.push(R('text', { key: 'x' + t, x: X(t), y: H - 8, textAnchor: 'middle', fill: 'var(--mut)' }, t)));
    if (opts.zero) kids.push(R('line', { key: 'z', x1: L, x2: W - Rr, y1: Y(0), y2: Y(0), stroke: 'var(--mut)' }));
    (opts.marks || []).forEach((m, i) => {
      kids.push(R('line', { key: 'm' + i, x1: X(m[0]), x2: X(m[0]), y1: T, y2: H - B, stroke: 'var(--mut)', strokeDasharray: '1 3' }));
      kids.push(R('text', { key: 'mt' + i, x: X(m[0]) + 4, y: T + 8 + (m[2] || 0), fill: 'var(--mut)' }, m[1]));
    });
    series.forEach((sr, si) => {
      kids.push(R('polyline', { key: 'p' + si, points: sr.d.map(p => X(p[0]) + ',' + Y(p[1])).join(' '), fill: 'none', stroke: 'var(--fg)', strokeWidth: sr.w || 1.5, strokeOpacity: sr.o ?? 1, strokeDasharray: sr.dash || 'none' }));
      sr.d.forEach((p, i) => kids.push(R('circle', { key: 'c' + si + i, cx: X(p[0]), cy: Y(p[1]), r: 6, fill: 'transparent' }, R('title', null, `${sr.name ? sr.name + ' · ' : ''}${p[0]}: ${opts.fmt ? opts.fmt(p[1]) : p[1]}`))));
      if (sr.name) { const last = sr.d[sr.d.length - 1]; kids.push(R('text', { key: 'n' + si, x: X(last[0]) + 4, y: Y(last[1]) + 3, fill: 'var(--fg)', fillOpacity: sr.o ?? 1 }, sr.name)); }
    });
    (opts.labels || []).forEach((l, i) => kids.push(R('text', { key: 'l' + i, x: X(l[0]) + (l[3] || 0), y: Y(l[1]) - 6, textAnchor: l[4] || 'middle', fill: 'var(--fg)' }, l[2])));
    return this.svg(W, H, kids);
  }
  barChart(rows, opts) {
    const R = React.createElement; const W = 640, rh = 22, gap = 8, L = opts.labelW || 150, H = rows.length * (rh + gap) + 6;
    const max = opts.max || Math.max(...rows.map(r => r.v));
    const kids = rows.flatMap((r, i) => {
      const y = 3 + i * (rh + gap); const w = (W - L - 60) * r.v / max;
      return [
        R('text', { key: 'l' + i, x: L - 8, y: y + rh / 2 + 3, textAnchor: 'end', fill: 'var(--fg)' }, r.label),
        R('rect', { key: 'r' + i, x: L, y, width: w, height: rh, fill: 'var(--fg)', fillOpacity: r.o ?? 1 }),
        R('text', { key: 'v' + i, x: L + w + 6, y: y + rh / 2 + 3, fill: 'var(--mut)' }, r.txt ?? r.v)];
    });
    return this.svg(W, H, kids);
  }
  arcCharts() {
    return {
      chartDenarius: this.lineChart([{ d: [[-211, 97], [-23, 95], [64, 93], [117, 89], [180, 79], [215, 50], [250, 40], [270, 5]], name: '' }], { h: 180, y0: 0, y1: 100, yticks: [0, 50, 100], fmt: v => v + '%', xticks: [-200, -100, 0, 100, 200, 270], labels: [[-23, 95, 'Augustus ~95%', 0, 'start'], [64, 93, 'Nero clips the coin, 64 CE', 40], [215, 50, 'Caracalla', 30], [270, 5, '<5% by the 270s', -10, 'end']] }),
      chartRatio: this.lineChart([{ d: [[-550, 13.3], [1500, 11], [1717, 15.2], [1792, 15], [1834, 16], [1865, 15.5], [1873, 16], [1900, 33], [1930, 60], [1971, 25], [2026, 90]], name: 'market ratio' }], { h: 200, y0: 0, y1: 100, yticks: [15, 30, 60, 90], fmt: v => v + ':1', xticks: [-550, 0, 500, 1000, 1500, 2026], marks: [[1873, 'Silver demonetised, 1871–73', 0]], labels: [[-550, 13.3, 'Croesus 13.3:1', 0, 'start'], [1865, 15.5, 'Latin Monetary Union 15.5:1', -20, 'end'], [2026, 90, '~90:1 today', -8, 'end']] }),
      chartGoldStd: this.lineChart([{ d: [[1717, 1], [1816, 1], [1854, 2], [1871, 3], [1873, 8], [1879, 12], [1897, 20], [1900, 30], [1914, 59], [1919, 5], [1926, 40], [1931, 25], [1933, 12], [1936, 2]], name: 'countries' }], { h: 200, y0: 0, y1: 65, yticks: [0, 20, 40, 60], xticks: [1717, 1750, 1800, 1850, 1900, 1936], marks: [[1717, "Newton's guinea", 0], [1871, 'Germany, then the US', 14], [1914, 'War suspends it', 0], [1931, 'Britain leaves', 28]] }),
      chartBW: this.barChart([{ label: 'US gold stock, 1950', v: 23, txt: '$23 bn' }, { label: 'Foreign $ claims, 1950', v: 8, txt: '$8 bn', o: .45 }, { label: 'US gold stock, 1960', v: 18, txt: '$18 bn' }, { label: 'Foreign $ claims, 1960', v: 19, txt: '$19 bn', o: .45 }, { label: 'US gold stock, Aug 1971', v: 10, txt: '$10 bn' }, { label: 'Foreign $ claims, Aug 1971', v: 45, txt: '~$45 bn — c. 4×', o: .45 }], { labelW: 190 }),
      chartInflation: this.lineChart([{ d: [[1965, 1.6], [1966, 2.9], [1967, 3.1], [1968, 4.2], [1969, 5.5], [1970, 5.7], [1971, 4.4], [1972, 3.2], [1973, 6.2], [1974, 11.0], [1975, 9.1], [1976, 5.8], [1977, 6.5], [1978, 7.6], [1979, 11.3], [1980, 13.5], [1981, 10.3], [1982, 6.2], [1983, 3.2], [1984, 4.3], [1985, 3.6]], name: 'US CPI' }], { h: 210, y0: 0, y1: 15, yticks: [0, 5, 10, 14], fmt: v => v + '%', xticks: [1965, 1970, 1975, 1980, 1985], marks: [[1971, 'Gold window shut', 0], [1973, 'Oil ×4', 14], [1979, 'Oil ×2 · Volcker', 0], [1982, 'Fed funds ~20%', 14]] }),
      chartCrises: this.barChart([{ label: 'Latin America 1982', v: 1, txt: 'IMF programmes; Brady bonds 1989' }, { label: 'Black Monday 1987', v: 1, txt: 'Fed liquidity — the “Greenspan put”' }, { label: 'Japan bubble 1990', v: 2, txt: 'Zero rates, first QE 2001' }, { label: 'ERM crisis 1992', v: 1, txt: 'Pound and lira forced out' }, { label: 'Mexico 1994', v: 2, txt: '$50 bn US–IMF package' }, { label: 'Asia 1997', v: 3, txt: '$110+ bn IMF; reserve hoarding' }, { label: 'Russia · LTCM 1998', v: 2, txt: 'Fed-brokered rescue; rate cuts' }, { label: 'Argentina · dot-com 2001', v: 2, txt: '$100 bn default; Fed to 1%' }, { label: 'Global 2008', v: 6, txt: 'TARP $700 bn; QE $1.75 tn; swap lines' }], { labelW: 170, max: 6 }),
      chartDebt: this.lineChart([{ d: [[1971, 0.4], [1975, 0.5], [1980, 0.9], [1985, 1.8], [1990, 3.2], [1995, 4.9], [2000, 5.7], [2003, 6.8], [2008, 10.0], [2012, 16.1], [2016, 19.6], [2019, 22.7], [2020, 27.7], [2022, 31.4], [2024, 36.2], [2026, 39.0]], name: '$ tn' }], { h: 210, y0: 0, y1: 42, yticks: [0, 10, 20, 30, 39], fmt: v => '$' + v + ' tn', xticks: [1971, 1980, 1990, 2000, 2010, 2020, 2026], marks: [[1981, 'Reagan deficits', 0], [2001, 'Post-9/11 wars, ~$8 tn', 0], [2008, 'Crisis · QE', 14], [2020, 'COVID', 0]] }),
      chartReserves: this.barChart([{ label: 'Gold', v: 27, txt: '27%' }, { label: 'US Treasuries', v: 22, txt: '22%', o: .45 }, { label: 'Euro assets', v: 15, txt: '15%', o: .45 }, { label: 'Gold, a year earlier', v: 20, txt: '20%', o: .2 }], { labelW: 130, max: 30 }),
      chartCBBuying: this.lineChart([{ d: [[2010, 79], [2011, 481], [2012, 569], [2013, 629], [2014, 601], [2015, 580], [2016, 395], [2017, 379], [2018, 656], [2019, 605], [2020, 255], [2021, 450], [2022, 1082], [2023, 1037], [2024, 1045], [2025, 863]], name: 't' }], { h: 160, y0: 0, y1: 1200, yticks: [0, 500, 1000], xticks: [2010, 2015, 2020, 2025], marks: [[2022, 'Reserves frozen', 0]] }),
      chartGold: this.lineChart([{ d: [[1971, 35], [1972, 58], [1974, 195], [1976, 105], [1978, 208], [1980, 850], [1982, 375], [1985, 300], [1987, 500], [1990, 385], [1995, 385], [1999, 253], [2003, 363], [2006, 600], [2008, 870], [2011, 1900], [2013, 1200], [2015, 1050], [2018, 1280], [2020, 2000], [2022, 1800], [2023, 2060], [2024, 2600], [2025, 3431], [2026.1, 5590], [2026.7, 4490]], name: '$/oz' }], { h: 240, log: true, y0: 30, y1: 7000, yticks: [35, 100, 300, 850, 2000, 5590], fmt: v => '$' + v.toLocaleString(), xticks: [1971, 1980, 1990, 2000, 2010, 2020, 2026], marks: [[1971, '$35', 0], [1980, '$850 · Volcker', 0], [1999, 'CBGA — the low', 0], [2008, 'Crisis · QE', 0], [2022, 'Frozen reserves', 0]] })
    };
  }
  currentStage() {
    if (this.state.route.view !== 'arc') return 0;
    const els = [...document.querySelectorAll('[data-stage]')]; let act = 1; const mid = window.innerHeight * 0.4;
    els.forEach(el => { if (el.getBoundingClientRect().top <= mid) act = +el.dataset.stage; });
    return act;
  }
  scrollToSection() {
    const sec = this.state.route.sec; const off = this.state.headerH + 20;
    requestAnimationFrame(() => {
      if (sec) { const el = document.getElementById(sec); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off }); }
      else window.scrollTo({ top: 0 });
    });
  }
  chapter(vol, slug) { return this.state.manifest.find(m => m.vol === vol && m.slug === slug); }
  href(m, sec) { return '#/' + m.vol + '/' + m.slug + (sec ? '/' + sec : ''); }
  short(m) { if (m.num === '00') return 'Directory / reading order'; return m.title.replace(/^\d+\s+—\s+/, '').split(/[:(]/)[0].trim(); }
  // ---- inline rendering with glossary hover + file refs
  inline(text, ctx) {
    const R = React.createElement; const toks = this.md.tokenizeInline(text); const out = []; let k = 0;
    const gloss = ctx.gloss !== false && GLOSSARY_HOVER;
    const pushText = (str) => {
      // file refs: "file 02", "files 03 and 05"
      const parts = str.split(/(\bfiles?\s+\d{2}(?:(?:,|\s+and)\s+\d{2})*)/i);
      parts.forEach(part => {
        if (/^\bfiles?\s+\d{2}/i.test(part) && ctx.vol) {
          const bits = part.split(/(\d{2})/);
          bits.forEach(b => {
            if (/^\d{2}$/.test(b)) {
              const m = this.state.manifest.find(x => x.vol === ctx.vol && x.num === b);
              out.push(m ? R('a', { key: k++, href: this.href(m), title: m.title, style: { textDecorationColor: 'var(--mut)' } }, b) : b);
            } else if (b) out.push(b);
          });
          return;
        }
        if (gloss && this.glossRe && !ctx.usedGloss.done) {
          const m = part.match(this.glossRe);
          if (m) {
            const g = this.glossMap[m[1].toLowerCase()];
            if (g && !ctx.usedGloss.set.has(g.id)) {
              ctx.usedGloss.set.add(g.id);
              out.push(part.slice(0, m.index)); out.push(this.term(g, m[1], k++)); pushText(part.slice(m.index + m[1].length)); return;
            }
          }
        }
        out.push(part);
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
    const R = React.createElement; const open = this.state.hoverTerm === g.id + label;
    return R('span', { key, style: { position: 'relative', borderBottom: '1px dotted var(--mut)', cursor: 'help' }, onMouseEnter: () => this.setState({ hoverTerm: g.id + label }), onMouseLeave: () => this.setState({ hoverTerm: null }) }, label,
      open ? R('span', { style: { position: 'absolute', left: 0, top: '100%', marginTop: 6, zIndex: 30, width: 320, maxWidth: '80vw', background: 'var(--bg)', color: 'var(--fg)', border: '1px solid var(--fg)', padding: '10px 12px', fontSize: 14, lineHeight: 1.45, fontStyle: 'normal', fontWeight: 400, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } },
        R('span', { style: { fontFamily: MONO, fontSize: 11, color: 'var(--mut)', display: 'block', marginBottom: 4 } }, g.term), this.md.stripInline(g.def), ' ',
        R('a', { href: '#/glossary/' + g.id, style: { fontFamily: MONO, fontSize: 11, color: 'var(--mut)' } }, 'glossary →')) : null);
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
    const url = location.origin + location.pathname + (r.view === 'article' ? '#/' + r.vol + '/' + r.slug : '#/' + r.view) + (sec ? '/' + sec : '');
    navigator.clipboard && navigator.clipboard.writeText(url);
    this.setState({ copied: sec || 'page' }); clearTimeout(this.ct); this.ct = setTimeout(() => this.setState({ copied: false }), 1600);
  }
  static ERAS = {
    gold: [[-650, 'Before coin', 'Metal by weight: silver as the unit of account, gold as treasure and the stuff of kings. Power sits with whoever owns the scales and the mines.'], [500, 'Coin and empire', 'Lydia invents the coin; Persia, Rome and Byzantium make it imperial. Rome discovers debasement — the first inflation.'], [1500, 'The Middle Ages', 'Western Europe on silver pennies for five centuries; Islamic dinars, Mali\'s gold and the Florentine florin bring gold back.'], [1800, 'Early modern', 'American silver floods Europe; prices triple. Bimetallic ratios keep breaking, and Newton\'s mistake puts Britain on gold.'], [1900, 'The 19th century', 'Gold rushes, then the classical gold standard: a currency is a weight of gold, exchange rates are fixed, and deflation bites.'], [1972, '1900 – 1971', 'War breaks the standard; Bretton Woods makes the dollar gold\'s proxy; the proxy fails.'], [9999, 'After 1971', 'Officially just a commodity — yet the price runs from $35 to $850, falls for twenty years, and after 2022 central banks buy it back faster than at any time since the 1960s.']],
    after: [[1980, 'The 1970s', 'No anchor: two oil shocks, the Great Inflation, gold $35 → $850. Oil is priced in dollars; Volcker restores credibility with 20% rates.'], [1990, 'The 1980s', 'Debt crisis in Latin America, the managed dollar, Japan\'s bubble, and the first global bank rules.'], [2000, 'The 1990s', 'New nations and currencies, the euro, central-bank independence — and a crisis every few years from Mexico to Russia.'], [2010, 'The 2000s', 'China joins the world economy; cheap money builds a housing bubble; 2008 is the fiat era\'s 1929, answered by QE.'], [2020, 'The 2010s', 'Zero rates, eurozone crisis, Bitcoin and stablecoins; money becomes almost entirely information.'], [9999, 'The 2020s', 'Pandemic stimulus, the first serious inflation in forty years, reserves frozen — and central banks go back to gold.']]
  };
  parseYear(date) {
    const d = date.replace(/[*_]/g, ''); let y;
    const c = d.match(/(\d+)(?:st|nd|rd|th)\s*(?:[–-]\s*\d+(?:st|nd|rd|th))?\s*c(?:entury|\.)/i);
    if (c) y = (+c[1] - 1) * 100 + 50; else { const m4 = d.match(/\b\d{4}\b/); const m = m4 || d.match(/\d{1,4}/); y = m ? +m[0] : 0; }
    return /BCE/.test(d) ? -y : y;
  }
  rowRefs(vol, r) {
    const text = this.md.stripInline((r[1] || '') + ' ' + (r[2] || ''));
    const stop = /^(The|And|First|Second|New|Gold|Silver|Bank|Act|War|Crisis|Agreement|Treaty|United|States|Europe|European|World|Money|Coins?|Central|Federal|System|Standard|Reserve|Dollar|Price|Rate|Rates)$/;
    const words = [...new Set((text.match(/\b[A-Z][a-zA-Zé'’-]{3,}\b/g) || []).filter(w => !stop.test(w)))].slice(0, 8);
    const years = [...new Set((r[0] || '').match(/\b\d{4}\b/g) || [])];
    if (!words.length && !years.length) return [];
    const out = [];
    for (const m of this.state.manifest) {
      if (/timeline|glossary|sources|readme/.test(m.slug)) continue;
      const bl = this.state.blocks[m.slug + '@' + m.vol] || []; let sec = null, best = null;
      for (const b of bl) {
        if (b.type === 'h2') { sec = b.id; continue; }
        if (b.type !== 'p') continue;
        const t = b.text; let score = 0;
        words.forEach(w => { if (t.includes(w)) score += 2; }); years.forEach(y => { if (t.includes(y)) score += 1; });
        if (score >= 3 && (!best || score > best.score)) best = { score, sec };
      }
      if (best) out.push({ m, ...best, same: m.vol === vol ? 1 : 0 });
    }
    out.sort((a, b) => b.same - a.same || b.score - a.score);
    return out.slice(0, 2).map(o => ({ href: this.href(o.m, o.sec), label: ({ gold: 'I·', after: 'II·', bitcoin: 'III·' }[o.m.vol]) + o.m.num + ' ' + this.short(o.m) }));
  }
  timelineGroups() {
    this.refCache = this.refCache || {};
    const q = this.state.tlq.trim().toLowerCase(); const groups = [];
    const big = /Varna|Hammurabi|Lydia strikes|Croesus|Darius|Alexander coins|Denarius debased|Constantine|Abd al-Malik|Charlemagne|jiaozi|Florence strikes|Mansa Musa|Potosí|Newton|Bank of England|Britain (leaves|suspends|returns|adopts|formally)|California|Germany adopts|Coinage Act|Witwatersrand|Bretton Woods|Roosevelt|Gold Pool|Nixon suspends|Smithsonian|major currencies float|Yom Kippur|Herstatt|Jamaica|Volcker|Gold peaks|Mexico announces|Plaza|Black Monday|Basel I\b|Berlin Wall|Soviet Union dissolved|Maastricht|ERM crisis|Tequila|Thai baht|Asian|Russia defaults|LTCM|euro (launched|notes)|China joins WTO|9\/11|Iraq invaded|Lehman|QE1|Bitcoin genesis|Whatever it takes|Draghi|Tether|COVID|Russia invades|CPI 9\.1|Liberation Day|GENIUS|gold \$3,000|gold peaks|record|\$5,590|Basel III/i;
    const onlyBig = !this.state.tlAll;
    for (const vol of ['gold', 'after']) {
      const m = this.state.manifest.find(x => x.vol === vol && x.slug.includes('timeline')); if (!m) continue;
      const t = (this.state.blocks[m.slug + '@' + vol] || []).find(b => b.type === 'table'); if (!t) continue;
      const eras = App.ERAS[vol];
      const buckets = eras.map(e => ({ id: vol + '-era-' + e[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), vol: vol === 'gold' ? 'Vol. I' : 'Vol. II', label: e[1], gloss: e[2], rows: [] }));
      t.rows.forEach((r, i) => {
        if (q && !r.join(' ').toLowerCase().includes(q)) return;
        const y = this.parseYear(r[0] || ''); let k = eras.findIndex(e => y < e[0]); if (k < 0) k = eras.length - 1;
        const isBig = big.test(r[1] || '') || big.test(r[2] || '');
        if (onlyBig && !isBig && !q) return;
        const ck = vol + i; const refs = this.refCache[ck] || (this.refCache[ck] = this.rowRefs(vol, r));
        buckets[k].rows.push({
          id: vol + '-tl-' + i, refs, hasRefs: refs.length > 0, date: this.md.stripInline(r[0] || ''),
          eventEl: this.inline(r[1] || '', { vol, gloss: false, usedGloss: { set: new Set() } }),
          sigEl: this.inline((r[2] || '').replace(/^—$/, ''), { vol, gloss: false, usedGloss: { set: new Set() } }),
          size: isBig ? '20px' : '15.5px', weight: isBig ? 500 : 400, pad: isBig ? '18px' : '11px', dot: isBig ? '11px' : '7px',
          dotBg: isBig ? 'var(--fg)' : 'var(--bg)', dotTop: isBig ? '22px' : '17px', dateColor: isBig ? 'var(--fg)' : 'var(--mut)'
        });
      });
      buckets.forEach(b => { b.count = b.rows.length; if (b.rows.length) groups.push(b); });
    }
    return groups;
  }
  search() {
    const q = this.state.query.trim().toLowerCase(); if (q.length < 2) return [];
    const R = React.createElement; const res = [];
    for (const m of this.state.manifest) {
      const bl = this.state.blocks[m.slug + '@' + m.vol]; let sec = null; let n = 0;
      for (const b of bl) {
        if (b.type === 'h2') sec = b.id;
        const txt = b.type === 'p' || b.type === 'quote' ? this.md.stripInline(b.text) : b.type === 'table' ? b.rows.map(r => r.join(' — ')).join('\n') : b.type === 'ul' || b.type === 'ol' ? b.items.join('\n') : '';
        const idx = txt.toLowerCase().indexOf(q); if (idx < 0) continue;
        const line = b.type === 'table' ? txt.split('\n').find(l => l.toLowerCase().includes(q)) : txt; const li = line.toLowerCase().indexOf(q);
        const start = Math.max(0, li - 110); const end = Math.min(line.length, li + q.length + 160);
        const snippet = [start > 0 ? '…' : '', line.slice(start, li), R('mark', { key: 'm', style: { background: 'var(--mark)', color: 'inherit' } }, line.slice(li, li + q.length)), line.slice(li + q.length, end), end < line.length ? '…' : ''];
        res.push({ href: this.href(m, sec), label: ({ gold: 'Vol. I · ', after: 'Vol. II · ', bitcoin: 'Vol. III · ' }[m.vol]) + m.num + ' — ' + this.short(m), snippet });
        if (++n >= 3) break;
      }
      if (res.length > 80) break;
    }
    return res;
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
      shellCols: narrow ? 'minmax(0,1fr)' : 'minmax(0,1fr) 210px',
      brand: 'Gold → Dollar → Crypto',
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
      selectDisplay: 'block',
      progressPct: (st.progress * 100).toFixed(1) + '%',
      query: st.query, tlq: st.tlq, glq: st.glq,
      bodyFontSize: BODY_SIZE + 'px'
    };
    vals.onQuery = e => {
      const v = e.target.value; this.setState({ query: v });
      if (v.trim().length >= 2) { if (r.view !== 'search') { this.prevHash = location.hash; location.hash = '#/search'; } }
      else if (r.view === 'search') location.hash = this.prevHash || '#/arc';
    };
    vals.onTlq = e => this.setState({ tlq: e.target.value });
    vals.onGlq = e => this.setState({ glq: e.target.value });
    vals.toggleTheme = () => {
      const cur = document.body.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = next; localStorage.setItem('mr-theme', next); this.setState({ theme: next });
    };
    vals.themeLabel = (st.theme || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')) === 'dark' ? '☾ dark' : '☀ light';
    ['Timeline', 'Takeaways', 'Glossary', 'Arc', 'Research'].forEach(n => vals['nav' + n] = r.view === n.toLowerCase() ? 'var(--fg)' : 'var(--mut)');
    const cur = r.view === 'article' ? this.chapter(r.vol, r.slug) : null;
    vals.allChapters = st.manifest.map(m => ({ href: this.href(m), optLabel: ({ gold: 'I·', after: 'II·', bitcoin: 'III·' }[m.vol]) + m.num + ' ' + this.short(m) }));
    vals.selectValue = cur ? this.href(cur) : '';
    vals.onSelect = e => { if (e.target.value) location.hash = e.target.value; };
    vals.isArticle = !!cur; vals.isTimeline = r.view === 'timeline'; vals.isGlossary = r.view === 'glossary';
    vals.isTakeaways = r.view === 'takeaways'; vals.isSearch = r.view === 'search';
    vals.toc = []; vals.tocLabel = 'Contents';
    vals.isArc = r.view === 'arc';
    if (vals.isArc) {
      const act = st.stage || 1; const A = App.ARC;
      vals.arcBand = A.map(a => ({ href: '#/arc/arc-' + a.n, title: a.title, label: narrow ? ROMAN[a.n - 1] : a.label, flex: a.flex, bg: a.n === act ? 'var(--fg)' : 'transparent', color: a.n === act ? 'var(--bg)' : 'var(--mut)' }));
      const active = A[act - 1]; vals.arcActiveAnchor = active.anchor; vals.arcActivePower = active.power;
      Object.assign(vals, this.arcCharts());
      vals.tocLabel = 'Regimes';
      vals.toc = A.map(a => ({ text: ROMAN[a.n - 1] + ' · ' + a.title, href: '#/arc/arc-' + a.n, indent: '0' }));
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
      const refs = new Set([...(st.docs[key] || '').matchAll(/\bfiles?\s+(\d{2}(?:(?:,|\s+and)\s+\d{2})*)/gi)].flatMap(m => m[1].match(/\d{2}/g)));
      vals.related = [...refs].filter(n => n !== cur.num).sort().map(n => list.find(m => m.num === n)).filter(Boolean).map(m => ({ num: m.num, title: this.short(m), href: this.href(m) }));
      vals.hasRelated = vals.related.length > 0;
      const allCollapsed = bl.filter(b => b.type === 'h2').every(b => st.collapsed[b.id]);
      vals.toggleAll = () => { const c = {}; if (!allCollapsed) bl.filter(b => b.type === 'h2').forEach(b => c[b.id] = true); this.setState({ collapsed: c }); };
      vals.toggleAllLabel = allCollapsed ? 'Expand all sections' : 'Collapse all sections';
      vals.copyPageLink = () => this.copyLink(null);
      vals.copyLabel = st.copied === 'page' ? 'Link copied' : 'Copy link to this file';
      vals.rawHref = BASE + cur.path;
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
        mk('gold', 'Vol. I', '4600 BCE – 1971', 'Gold: from bare metal to world money and back', 'How did a yellow metal become the unit everything else was measured in, how did it share and then lose that job, and why does it still hold value when nothing is priced in it?'),
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
      vals.toc = vals.tlGroups.map(g => ({ text: (g.vol === 'Vol. I' ? 'I · ' : 'II · ') + g.label, href: '#/timeline/' + g.id, indent: '0' }));
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
      vals.searchSummary = st.query.trim().length < 2 ? 'Type at least two characters' : vals.searchResults.length + ' passages match “' + st.query.trim() + '”';
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
      const href = location.origin + location.pathname + (cur ? '#/' + cur.vol + '/' + cur.slug + (sec ? '/' + sec : '') : location.hash);
      this.setState({ quote: { text, x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 40, label, secTitle, href }, askOpen: false, askQ: '', promptCopied: false });
    };
    return vals;
  }
  render() {
    const v = this.renderVals();
    return (
      <div style={s('min-height:100vh;display:flex;flex-direction:column')}>
        <div style={s('position:fixed;top:0;left:0;height:2px;background:var(--fg);z-index:20', { width: v.progressPct })}></div>
        <header ref={this.headerRef} style={s("position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--rule);display:flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px", { gap: v.headerGap, rowGap: '8px', padding: v.headerPad, height: v.headerHeight, minHeight: '52px', flexWrap: v.headerWrap })}>
          <a href="#/arc" style={s('text-decoration:none;white-space:nowrap;display:flex;gap:10px;align-items:center')}>
            <span style={s('width:7px;height:7px;border:1px solid var(--fg);display:inline-block')}></span>{v.brand}
          </a>
          <select value={v.selectValue} onChange={v.onSelect} style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;background:transparent;color:var(--fg);border:1px solid var(--rule);padding:6px 8px;min-width:0", { display: v.selectDisplay, maxWidth: v.selectMax })}>
            <option value="">Files…</option>
            {v.allChapters.map(c => <option key={c.href} value={c.href}>{c.optLabel}</option>)}
          </select>
          <input type="search" placeholder="Search" value={v.query} onChange={v.onQuery} aria-label="Search all files"
            style={s('padding:6px 8px;font-size:12px;box-sizing:border-box;min-width:0;flex-shrink:1', { width: v.searchWidth })} />
          <div style={s('flex:1')}></div>
          <nav className="nav-scroll" style={s('display:flex;color:var(--mut);white-space:nowrap;align-items:center;min-width:0', { gap: v.navGap, flex: v.navFlex, overflowX: v.navOverflow })}>
            <a href="#/arc" style={s('text-decoration:none', { color: v.navArc })}>The arc</a>
            <a href="#/research" style={s('text-decoration:none', { color: v.navResearch })}>Research</a>
            <a href="#/timeline" style={s('text-decoration:none', { color: v.navTimeline })}>Timeline</a>
            <a href="#/takeaways" style={s('text-decoration:none', { color: v.navTakeaways })}>Takeaways</a>
            <a href="#/glossary" style={s('text-decoration:none', { color: v.navGlossary })}>Glossary</a>
            <button onClick={v.toggleTheme} title="Toggle color mode" style={s('color:var(--mut);font-size:12px')}>{v.themeLabel}</button>
          </nav>
        </header>
        <div style={s('display:grid;gap:0;flex:1', { gridTemplateColumns: v.shellCols })}>
          <main style={s('padding:40px clamp(16px,4vw,56px) 120px;max-width:820px;width:100%;box-sizing:border-box;justify-self:center;min-width:0')} onMouseUp={v.onArticleMouseUp}>

            {v.isArticle && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px")}>
                <span>{v.volLabel}</span><span>·</span><span>File {v.chapterNum}</span><span>·</span><span>{v.readTime} min read</span><span>·</span><span>{v.wordCount} words</span>
              </div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 32px;text-wrap:pretty')}>{v.chapterTitle}</h1>
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

            {v.isArc && <>
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>The arc · what money was anchored to, who held the power, and what broke it — nine regimes, 4600 BCE to 2026</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px;text-wrap:pretty')}>Every monetary order was built on the last one's failure</h1>
              <p style={s('font-size:17.5px;line-height:1.6;margin:0 0 36px;max-width:64ch;text-wrap:pretty')}>Money has had six anchors: a weight of metal, a ruler's stamp, a fixed ratio between two metals, a fixed weight of gold, a dollar redeemable in gold, and — since 1971 — nothing but a central bank's promise. Each hand-off moved power to whoever controlled the new anchor, and each new anchor eventually broke under the same pressure: the need to pay for more than the anchor allowed. Follow the band below or scroll.</p>

              <div style={s('position:sticky;z-index:5;background:var(--bg);padding:14px 0 12px;margin-bottom:40px;border-bottom:1px solid var(--rule)', { top: v.stickyTop })}>
                <div style={s('display:flex;gap:2px;height:28px')}>
                  {v.arcBand.map(b => (
                    <a key={b.href} href={b.href} title={b.title} className="hov-soft"
                      style={s("min-width:0;border:1px solid var(--fg);text-decoration:none;display:flex;align-items:center;padding:0 6px;overflow:hidden;font-family:'IBM Plex Mono',monospace;font-size:10px;white-space:nowrap;text-overflow:ellipsis", { flex: b.flex, background: b.bg, color: b.color })}>{b.label}</a>
                  ))}
                </div>
                <div style={s("display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--mut);margin-top:6px")}>
                  <span>3000 BCE</span><span>650 BCE</span><span>1252</span><span>1717</span><span>1944</span><span>1971</span><span>2026</span>
                </div>
                <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;margin-top:10px;display:flex;gap:16px;flex-wrap:wrap")}>
                  <span style={s('color:var(--mut)')}>Anchor now:</span><span>{v.arcActiveAnchor}</span>
                  <span style={s('color:var(--mut)')}>Power:</span><span>{v.arcActivePower}</span>
                </div>
              </div>

              <div style={s('display:flex;flex-direction:column')}>

                <section data-stage="1" id="arc-1" style={s('padding:8px 0 40px')}>
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
                      <figure style={s('margin:24px 0 0')}>
                        <div style={s('border:1px solid var(--rule);padding:16px')}>
                          <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:12px")}>The three-metal ladder that lasted until 1971 — who used which metal</div>
                          <div style={s('display:grid;grid-template-columns:90px 1fr;gap:8px 16px;font-size:14px;align-items:center')}>
                            <span style={s("font-family:'IBM Plex Mono',monospace;font-size:11px")}>Gold</span>
                            <div style={s('display:flex;align-items:center;gap:10px')}><div style={s('height:18px;width:22%;background:var(--fg)')}></div><span style={s('color:var(--mut)')}>treasuries, kings, settlement between states</span></div>
                            <span style={s("font-family:'IBM Plex Mono',monospace;font-size:11px")}>Silver</span>
                            <div style={s('display:flex;align-items:center;gap:10px')}><div style={s('height:18px;width:60%;background:var(--fg);opacity:.55')}></div><span style={s('color:var(--mut)')}>wages, taxes, daily commerce</span></div>
                            <span style={s("font-family:'IBM Plex Mono',monospace;font-size:11px")}>Copper</span>
                            <div style={s('display:flex;align-items:center;gap:10px')}><div style={s('height:18px;width:38%;background:var(--fg);opacity:.25')}></div><span style={s('color:var(--mut)')}>small change</span></div>
                          </div>
                        </div>
                        <figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>A 4–8 g gold coin was weeks of a labourer's wage; it could not buy bread. Vol. I, file 05.</figcaption>
                      </figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Armies and markets needed a unit that could be counted rather than weighed. Whoever could certify metal in advance would own the standard.</div>
                </div>

                <section data-stage="2" id="arc-2" style={s('padding:0 0 40px')}>
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
                      <figure style={s('margin:24px 0 0')}>{v.chartDenarius}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Silver content of the Roman denarius, approximate. The template for every later inflation: the issuer keeps the face value and removes the substance. Vol. I, file 06.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Western Europe went five centuries with silver pennies only. Trade with the East and new African gold via Mali brought gold coin back — and the two metals had to be priced against each other.</div>
                </div>

                <section data-stage="3" id="arc-3" style={s('padding:0 0 40px')}>
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
                      <figure style={s('margin:24px 0 0')}>{v.chartRatio}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Legal gold:silver ratios set by states versus what actually happened to the market ratio once silver was demonetised in the 1870s. Vol. I, file 05.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> In 1717 Isaac Newton, as Master of the Mint, priced the guinea too high in silver. Silver drained out of Britain and the world's leading trader slid onto gold by accident.</div>
                </div>

                <section data-stage="4" id="arc-4" style={s('padding:0 0 40px')}>
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
                      <figure style={s('margin:24px 0 0')}>{v.chartGoldStd}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Countries on a gold standard. The system covered the world for barely forty years before the First World War suspended it everywhere. Vol. I, file 07.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Two world wars and a depression. Governments suspended convertibility to print for war, tried to return in the 1920s at the old parities, and the 1930s taught democracies they would not accept mass unemployment to defend a gold price. Only one country still had the gold.</div>
                </div>

                <section data-stage="5" id="arc-5" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>V</span>1944<br />– 1971
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Bretton Woods: the dollar becomes gold's proxy</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>The dollar at $35 an ounce, convertible for foreign governments; every other currency pegged to the dollar. Central banks held Treasuries instead of gold because Treasuries paid interest and could — it seemed — be turned into gold on demand.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>The US Treasury, holder of most of the world's gold in 1944 and the only intact major economy. The IMF was built to police the pegs.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>The Triffin dilemma. The world needed dollars for reserves, so the US had to run deficits; the more dollars abroad, the less credible the gold promise. Vietnam and the Great Society pushed money supply far past what gold could cover.</div>
                      </div>
                      <figure style={s('margin:24px 0 0')}>{v.chartBW}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Foreign official dollar claims against the US gold stock, approximate. By 1971 claims were roughly four times the gold; Britain asked to convert $3 bn the week before the window shut. Vol. II, file 01.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>15 August 1971 →</span> Nixon suspends convertibility, “temporarily”. For the first time in history no currency on earth is defined as a weight of anything. “The dollar is our currency, but it's your problem.”</div>
                </div>

                <section data-stage="6" id="arc-6" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VI</span>1971<br />– 1982
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>No anchor: the Great Inflation, then oil as the substitute</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>None, then oil. In 1974 Saudi Arabia agreed to price oil in dollars and park the proceeds in Treasuries. Every importer now needed dollars for energy, whether or not it traded with America.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>OPEC over prices, the US Treasury over the currency they were set in — and, from 1979, Paul Volcker, who proved a fiat currency could be made credible by raising rates to 20% and accepting a deep recession.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>The worst peacetime inflation in the West: US CPI touched 14%, Britain 24%, and gold — now just a commodity, officially — went from $35 to $850 in nine years. Floating rates created a hedging industry: currency futures 1972, options 1973, swaps 1981.</div>
                      </div>
                      <figure style={s('margin:24px 0 0')}>{v.chartInflation}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>US consumer-price inflation, annual %, 1965–1985. Two oil shocks and no anchor; then the Volcker squeeze. Vol. II, file 02.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> Volcker's lesson was institutionalised: money would be anchored not by metal but by independent central banks with inflation targets. New Zealand first (1990), the euro treaty next, almost everyone by 2000.</div>
                </div>

                <section data-stage="7" id="arc-7" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VII</span>1982<br />– 2008
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Anchored by credibility: central banks, and a crisis every decade</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>A promise: an independent central bank targeting ~2% inflation. Freed from metal, credit could expand without limit — securitisation, Eurodollars, derivatives, cross-border capital.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Central banks, and the IMF as crisis manager — lending on condition of austerity, devaluation and reform. Basel I (1988) wrote the first global bank rules because no gold reserve constrained lending any more.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Low inflation, and a debt crisis roughly every four years: Latin America, Japan, the ERM, Mexico, Asia, Russia and LTCM, Argentina, dot-com. Each was answered with a bigger bailout and a new rulebook; the Asian crisis taught emerging economies to hoard reserves.</div>
                      </div>
                      <figure style={s('margin:24px 0 0')}>{v.chartCrises}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Major financial crises of the fiat era, with the size of the rescue that followed. Vol. II, files 03, 05, 07.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>Why it changed →</span> 1% interest rates, deregulation and leverage produced the fiat era's 1929. This time the answer was not gold-standard deflation but the opposite: create money without limit.</div>
                </div>

                <section data-stage="8" id="arc-8" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>VIII</span>2008<br />– 2021
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>Money at will: zero rates, QE and the debt that followed</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>The central bank's own balance sheet. With rates at zero the Fed bought bonds with newly created reserves — QE1 alone $1.75 trillion — and in March 2020 did in weeks what had taken years after 2008.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Central banks as buyer of last resort for their own governments' debt; the Fed as lender of last resort to the world through swap lines. Bailouts for banks, austerity for citizens — and the politics that produced.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Asset inflation rather than consumer inflation at first; then, in 2021–23, the first serious inflation in forty years. US gross debt went from $10 trillion to $39 trillion. Bitcoin (2009) and stablecoins (2014) appeared as private answers.</div>
                      </div>
                      <figure style={s('margin:24px 0 0')}>{v.chartDebt}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>US gross federal debt, $ trillion, 1971–2026. Every war and crisis of the fiat era was borrowed for rather than paid for. Vol. II, files 06, 07, 09.</figcaption></figure>
                    </div>
                  </div>
                </section>
                <div style={s('padding:0 0 40px;display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s('border-left:1px solid var(--fg);margin-left:6px')}></div>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mut);max-width:60ch")}><span style={s('color:var(--fg)')}>24 February 2022 →</span> The US and EU freeze about $300 billion of Russia's central-bank reserves. Every reserve manager draws the same lesson: a dollar reserve is a claim the issuer can cancel. Gold in your own vault is not.</div>
                </div>

                <section data-stage="9" id="arc-9" style={s('padding:0 0 40px')}>
                  <div style={s('display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                    <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.6;color:var(--mut)")}>
                      <span style={s("color:var(--fg);font-size:22px;display:block;font-family:'Newsreader',serif;font-weight:500")}>IX</span>2022<br />– 2026
                    </div>
                    <div>
                      <h2 style={s('font-weight:500;font-size:26px;line-height:1.2;margin:0 0 18px;text-wrap:pretty')}>The weaponised dollar, and the quiet return to gold</h2>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;font-size:15px;line-height:1.5')}>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Anchor</div>Still the dollar for pricing, invoicing and settlement — it is on one side of 88% of all FX trades. But as a <em>store</em> of reserves, gold is being shared back in: 27% of global reserves at end-2025, above Treasuries (22%) and the euro (15%).</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>Who held the power</div>Sanctions gave the US Treasury a weapon; using it handed power to geology. Central banks — China, Poland, India, Turkey — bought over 1,000 tonnes a year for three years. Tether, a stablecoin issuer, was the single largest buyer of 2025.</div>
                        <div><div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>What it produced</div>Gold from $1,800 to a $5,590 peak in January 2026; the dollar's reserve share from 71% (2000) to 57%. Not de-dollarisation toward a rival currency, but a partial move back to the one asset that predates the dollar.</div>
                      </div>
                      <div style={s('display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:24px')}>
                        <figure style={s('margin:0')}>{v.chartReserves}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Share of global central-bank reserves, end-2025 (ECB, June 2026). Vol. I, file 09.</figcaption></figure>
                        <figure style={s('margin:0')}>{v.chartCBBuying}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Net central-bank gold purchases, tonnes per year (WGC). Vol. II, file 09.</figcaption></figure>
                      </div>
                      <figure style={s('margin:24px 0 0')}>{v.chartGold}<figcaption style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-top:8px")}>Gold in US dollars per ounce, 1971–2026, log scale. The price is a running vote on whether the promise will hold. Vol. I, file 09.</figcaption></figure>
                    </div>
                  </div>
                </section>

                <div style={s('padding:24px 0 0;border-top:1px solid var(--fg);display:grid', { gridTemplateColumns: v.stageCols, gap: v.stageGap })}>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut)")}>What stays</div>
                  <div style={s('font-size:17.5px;line-height:1.6;max-width:62ch;text-wrap:pretty')}>
                    <p style={s('margin:0 0 1em')}>Each regime moved the power to create money one step further from the ground — from the mine to the mint, from the mint to the bank, from the bank to the state, from the state to a committee. Each step bought elasticity: money that could be created in a crisis and to fight a war. Each step was paid for in the same coin — debasement, inflation, debt — and each collapse sent the world back, briefly, to the asset that is nobody's liability.</p>
                    <p style={s('margin:0')}>Gold is not the unit of account today because nothing is priced in it. It is the reserve underneath the system rather than the system itself — the role it held for most of history before 1870. The open question of 2026 is whether a currency that can be frozen can stay the world's store of value, or only its measuring stick.</p>
                    <div style={s("display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;font-family:'IBM Plex Mono',monospace;font-size:12px")}>
                      <a href="#/gold/08-why-the-dollar-replaced-gold">Why the dollar replaced gold →</a>
                      <a href="#/after/09-pandemic-inflation-and-weaponized-reserves-2020-2026">Where the system stands, Sep 2026 →</a>
                      <a href="#/timeline">Full timeline →</a>
                    </div>
                  </div>
                </div>
              </div>
            </>}

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
              <div style={s("font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:20px")}>Master timeline · 4600 BCE – 2026 · {v.timelineCount} {v.tlKind}</div>
              <h1 style={s('font-weight:500;font-size:34px;line-height:1.15;letter-spacing:-.012em;margin:0 0 20px')}>Six thousand years of gold, fifty-five of fiat</h1>
              <p style={s('font-size:17px;line-height:1.6;color:var(--mut);margin:0 0 28px;max-width:62ch;text-wrap:pretty')}>One chronology from both volumes, reduced to the turning points. Each era opens with what changed in it; every event links to the file that explains it. Show all entries or filter by name, place or year.</p>
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
                        <div style={s('line-height:1.35;text-wrap:pretty', { fontSize: rw.size, fontWeight: rw.weight })}>{rw.eventEl}</div>
                        <div style={s('font-size:14px;color:var(--mut);line-height:1.5;margin-top:4px')}>{rw.sigEl}</div>
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
              {v.searchResults.map((sr, i) => (
                <a key={sr.href + i} href={sr.href} style={s('display:block;text-decoration:none;padding:16px 0;border-top:1px solid var(--rule)')}>
                  <div style={s("font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mut);margin-bottom:6px")}>{sr.label}</div>
                  <div style={s('font-size:15px;line-height:1.55')}>{sr.snippet}</div>
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
