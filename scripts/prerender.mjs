import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMd, tokenizeInline } from '../src/md.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const origin = 'https://money-research-iota.vercel.app';
const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const volumeName = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin' };
const urls = [`${origin}/`];

function inline(text) {
  return tokenizeInline(text).map(token => {
    const value = escape(token.v);
    if (token.t === 'b') return `<strong>${value}</strong>`;
    if (token.t === 'i') return `<em>${value}</em>`;
    if (token.t === 'code') return `<code>${value}</code>`;
    if (token.t === 'link') {
      const href = token.href.trim();
      return /^(https?:\/\/|#\/|\/)/i.test(href) ? `<a href="${escape(href)}">${value}</a>` : value;
    }
    return value;
  }).join('');
}

function staticArticle(record) {
  const source = readFileSync(join(root, 'public', record.path), 'utf8');
  const blocks = parseMd(source);
  const body = blocks.map(block => {
    if (/^h[1-4]$/.test(block.type)) return `<${block.type} id="${escape(block.id)}">${inline(block.text)}</${block.type}>`;
    if (block.type === 'p') return `<p>${inline(block.text)}</p>`;
    if (block.type === 'quote') return `<blockquote>${inline(block.text)}</blockquote>`;
    if (block.type === 'ul' || block.type === 'ol') return `<${block.type}>${block.items.map(item => `<li>${inline(item)}</li>`).join('')}</${block.type}>`;
    if (block.type === 'hr') return '<hr>';
    if (block.type === 'table') return `<div class="static-table-wrap"><table><thead><tr>${block.header.map(cell => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return '';
  }).join('\n');
  return `<main class="static-article"><p class="eyebrow">Volume ${ { gold: 'I', after: 'II', bitcoin: 'III' }[record.vol] } · ${volumeName[record.vol]} · <a href="/">Money Research</a></p><p class="evidence-notice">This research chapter is under editorial review. Dated figures, legal status and broad conclusions require source verification.</p>${body}</main>`;
}

for (const record of manifest) {
  const path = `/${record.vol}/${record.slug}/`;
  const url = origin + path;
  const title = `${record.title.replace(/^\d+\s+—\s+/, '')} · Money Research`;
  const description = `${record.title.replace(/^\d+\s+—\s+/, '')}. A research chapter in Volume ${ { gold: 'I', after: 'II', bitcoin: 'III' }[record.vol] } — ${volumeName[record.vol]}.`;
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escape(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escape(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escape(url)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escape(url)}">`)
    .replace('<div id="root"></div>', `<div id="root">${staticArticle(record)}</div>`);
  const output = join(dist, record.vol, record.slug);
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'index.html'), html);
  for (const alias of record.aliases) {
    const aliasOutput = join(dist, record.vol, alias);
    mkdirSync(aliasOutput, { recursive: true });
    writeFileSync(join(aliasOutput, 'index.html'), html);
  }
  urls.push(url);
}

writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated ${manifest.length} article pages and sitemap.xml`);
