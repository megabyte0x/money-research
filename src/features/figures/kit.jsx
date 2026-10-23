import React from 'react';
import './figures.css';

// Figures reveal once when they scroll into view. Without IntersectionObserver
// (or with reduced motion, via the global CSS rule) they simply appear.
function useReveal() {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setInView(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

const ACCENTS = { gold: '#b8862f', after: '#487b91', bitcoin: '#c4732f', zcash: '#7a63b6' };

export function Figure({ vol, label, title, note, className = '', children }) {
  const [ref, inView] = useReveal();
  return <figure ref={ref} className={`fig ${className} ${inView ? 'is-in' : ''}`} style={{ '--acc': ACCENTS[vol] || 'var(--fg)' }}>
    <div className="fig-head"><span className="fig-label">{label || 'Figure'}</span>{title && <span className="fig-title">{title}</span>}</div>
    {children}
    {note && <figcaption className="fig-note">{note}</figcaption>}
  </figure>;
}

const r = (i, extra) => ({ 'data-r': '', style: { '--i': i, ...extra } });

/** Ordered stages joined by a line that draws across (or down, when vertical). */
export function Sequence({ items, vertical = false }) {
  return <ol className={`fig-seq ${vertical ? 'fig-seq-v' : ''}`} style={{ '--n': items.length }}>
    {items.map((item, i) => <li key={i} {...r(i)}>
      <span className="fig-node" aria-hidden="true" />
      {item.date && <span className="fig-date">{item.date}</span>}
      <strong>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</strong>
      {item.text && <span className="fig-text">{item.text}</span>}
    </li>)}
  </ol>;
}

/** Horizontal period bars on a (piecewise-linear) time axis. */
export function Periods({ rows, scale, ticks }) {
  const pos = year => {
    for (let i = 1; i < scale.length; i++) {
      const [y0, p0] = scale[i - 1], [y1, p1] = scale[i];
      if (year <= y1) return p0 + (Math.max(year, y0) - y0) / (y1 - y0) * (p1 - p0);
    }
    return 1;
  };
  const pct = year => (pos(year) * 100).toFixed(2) + '%';
  return <div className="fig-periods">
    {rows.map((row, i) => <div className="fig-period" key={row.label} {...r(i)}>
      <div className="fig-period-label">{row.href ? <a href={row.href}>{row.label}</a> : row.label}<span>{row.range}</span></div>
      <div className="fig-period-track">
        <span className={`fig-bar ${row.open ? 'fig-bar-open' : ''}`} style={{ left: pct(row.start), width: `calc(${pct(row.end)} - ${pct(row.start)})`, '--i': i, ...(row.color ? { background: row.color } : {}) }} />
      </div>
    </div>)}
    <div className="fig-period fig-axis" aria-hidden="true">
      <div className="fig-period-label" />
      <div className="fig-period-track">
        {ticks.map(([year, text]) => <span key={year} className="fig-tick" style={{ left: pct(year) }}>{text}</span>)}
      </div>
    </div>
  </div>;
}

/** Grouped items under status headings, e.g. solved / not solved. */
export function Columns({ groups }) {
  let k = 0;
  return <div className="fig-cols" style={{ '--cols': groups.length }}>
    {groups.map(group => <div key={group.label} className={`fig-col fig-tone-${group.tone || 'plain'}`}>
      <div className="fig-col-head" {...r(k++)}><span className="fig-swatch" aria-hidden="true" />{group.label}</div>
      {group.sub && <p className="fig-col-sub" {...r(k - 1)}>{group.sub}</p>}
      <ul>{group.items.map(item => {
        const it = typeof item === 'string' ? { text: item } : item;
        return <li key={it.text} {...r(k++)}>{it.href ? <a href={it.href}>{it.text}</a> : it.text}{it.note && <small>{it.note}</small>}</li>;
      })}</ul>
    </div>)}
  </div>;
}

/** Two columns joined by drawn connectors: a modern mechanism and its historical analogue. */
export function Pairs({ left, right, rows }) {
  return <div className="fig-pairs">
    <div className="fig-pairs-head" aria-hidden="true"><span>{left}</span><span /><span>{right}</span></div>
    {rows.map((row, i) => <div className="fig-pair" key={row.a} {...r(i)}>
      <span className="fig-pair-a">{row.href ? <a href={row.href}>{row.a}</a> : row.a}</span>
      <span className="fig-pair-link" aria-label="compared with"><i style={{ '--i': i }} /></span>
      <span className={`fig-pair-b ${row.none ? 'is-none' : ''}`}>{row.b}</span>
    </div>)}
  </div>;
}

/** Stacked layers; the first item is drawn at the top. A taper narrows toward the base. */
export function Layers({ layers, taper = true }) {
  const n = layers.length;
  return <div className={`fig-layers ${taper ? 'is-taper' : ''}`}>
    {layers.map((layer, i) => <div className={`fig-layer fig-tone-${layer.tone || 'plain'}`} key={layer.label} {...r(n - i, taper ? { '--w': `${100 - i * (40 / Math.max(1, n - 1))}%` } : undefined)}>
      <span className="fig-layer-label">{layer.label}</span>
      {layer.text && <span className="fig-layer-text">{layer.text}</span>}
      {layer.tag && <span className="fig-layer-tag">{layer.tag}</span>}
    </div>)}
  </div>;
}

/** Concentric scopes, innermost first. */
export function Scopes({ items }) {
  const build = i => {
    const item = items[i];
    return <div className="fig-scope" style={{ '--i': i }}>
      <div className="fig-scope-head" {...r(i)}><strong>{item.title}</strong><span className="fig-scope-verdict">{item.verdict}</span></div>
      {item.text && <p {...r(i)}>{item.text}</p>}
      {i > 0 && build(i - 1)}
    </div>;
  };
  return <div className="fig-scopes">{build(items.length - 1)}</div>;
}

export { r as reveal };
