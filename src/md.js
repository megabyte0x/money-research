// Minimal markdown → block parser for the research notes.
export function slugify(s) {
  return s.toLowerCase().replace(/[*_`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}
export function parseMd(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const blocks = [];
  let i = 0;
  const splitRow = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.+)$/))) {
      const text = m[2].trim();
      blocks.push({ type: 'h' + m[1].length, text, id: slugify(text) }); i++; continue;
    }
    if (/^---+$/.test(l.trim())) { blocks.push({ type: 'hr' }); i++; continue; }
    if (l.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(splitRow(lines[i])); i++; }
      const header = rows[0];
      const body = rows.filter((r, k) => k > 0 && !r.every(c => /^:?-{2,}:?$/.test(c)));
      blocks.push({ type: 'table', header, rows: body }); continue;
    }
    if (/^\s*([-*•]|\d+[.)])\s+/.test(l)) {
      const ordered = /^\s*\d+[.)]/.test(l);
      const items = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, ''); i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) { item += ' ' + lines[i].trim(); i++; }
        items.push(item);
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items }); continue;
    }
    if (l.trim().startsWith('>')) {
      let text = '';
      while (i < lines.length && lines[i].trim().startsWith('>')) { text += (text ? ' ' : '') + lines[i].replace(/^\s*>\s?/, ''); i++; }
      blocks.push({ type: 'quote', text }); continue;
    }
    let text = l.trim(); i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||\s*([-*•]|\d+[.)])\s|>|---)/.test(lines[i])) { text += ' ' + lines[i].trim(); i++; }
    blocks.push({ type: 'p', text });
  }
  return blocks;
}
// Inline tokenizer: returns [{t:'text'|'b'|'i'|'code'|'link', v, href}]
export function tokenizeInline(text, { linkifyUrls = false } = {}) {
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const out = []; let last = 0; let m;
  const pushPlain = (plain) => {
    if (!linkifyUrls) { if (plain) out.push({ t: 'text', v: plain }); return; }
    const urls = /https?:\/\/[^\s<>()\[\]{}"']+/gi;
    let offset = 0; let found;
    while ((found = urls.exec(plain))) {
      const candidate = found[0].replace(/[.,;:!?]+$/, '');
      if (!candidate || !isSafeContentHref(candidate)) continue;
      if (found.index > offset) out.push({ t: 'text', v: plain.slice(offset, found.index) });
      out.push({ t: 'link', v: candidate, href: candidate });
      offset = found.index + candidate.length;
    }
    if (offset < plain.length) out.push({ t: 'text', v: plain.slice(offset) });
  };
  while ((m = re.exec(text))) {
    if (m.index > last) pushPlain(text.slice(last, m.index));
    const s = m[0];
    if (s.startsWith('**')) out.push({ t: 'b', v: s.slice(2, -2) });
    else if (s.startsWith('`')) out.push({ t: 'code', v: s.slice(1, -1) });
    else if (s.startsWith('[')) { const mm = s.match(/^\[([^\]]+)\]\(([^)]+)\)$/); out.push({ t: 'link', v: mm[1], href: mm[2] }); }
    else out.push({ t: 'i', v: s.slice(1, -1) });
    last = m.index + s.length;
  }
  if (last < text.length) pushPlain(text.slice(last));
  return out;
}
// Links in supplied research Markdown are rendered only for explicit web or
// local research routes. Both the browser and static renderer use this rule.
export function isSafeContentHref(href) {
  if (typeof href !== 'string' || /[\u0000-\u0020\u007f\\]/.test(href)) return false;
  if (/^\/(?!\/)/.test(href) || /^#\//.test(href)) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const parsed = new URL(href);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !!parsed.hostname;
  } catch {
    return false;
  }
}
export function stripInline(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
// Glossary file → [{term, def, id}]
export function parseGlossary(src) {
  const out = [];
  for (const b of parseMd(src)) {
    if (b.type !== 'p') continue;
    const m = b.text.match(/^\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
    if (m) out.push({ term: m[1].trim(), def: m[2].trim(), id: slugify(m[1]) });
  }
  return out;
}
