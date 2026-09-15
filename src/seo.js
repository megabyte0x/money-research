import { SITE, METADATA_FIELDS, absoluteUrl, socialImageUrl } from './site-config.js';
import { DISCOVERY_COPY, HOME_COPY, METHODS_COPY, NOT_FOUND_COPY, SEARCH_COPY, VOLUME_COPY } from './page-copy.js';
import {
  canonicalPath, isDirectoryRecord, publicationStatus, shortTitle, VOLUME_IDS,
} from './routes.js';

export { METADATA_FIELDS };

const VOLUME_NAME = { gold: 'Gold', after: 'After Gold', bitcoin: 'Bitcoin' };
const VOLUME_ROMAN = { gold: 'I', after: 'II', bitcoin: 'III' };

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function chapterDescription(record, articleMetadata = {}) {
  const summary = articleMetadata[record.id]?.summary;
  if (summary?.answer) return summary.answer;
  const name = shortTitle(record);
  const role = record.slug.includes('timeline')
    ? `A chronology for Volume ${VOLUME_ROMAN[record.vol]} — ${VOLUME_NAME[record.vol]} — with dated events that still require source review.`
    : record.slug.includes('glossary')
      ? `Terms used in Volume ${VOLUME_ROMAN[record.vol]} — ${VOLUME_NAME[record.vol]} — of Money Research.`
      : record.slug.includes('sources')
        ? `Bibliography and locators for Volume ${VOLUME_ROMAN[record.vol]} — ${VOLUME_NAME[record.vol]}. Entries remain under editorial review.`
        : `${name} in Volume ${VOLUME_ROMAN[record.vol]} — ${VOLUME_NAME[record.vol]} — Money Research. Claims in this chapter remain under editorial review.`;
  return role;
}

export function resolvePage(input) {
  const kind = input.kind;
  const record = input.record;
  const articleMetadata = input.articleMetadata || {};
  const status = publicationStatus(kind, kind === 'redirect' ? record : null);
  let path = input.path;
  let title;
  let description;
  let pageType = kind;
  let socialType = 'website';
  let schema = kind;
  const breadcrumbs = [{ name: SITE.name, path: '/' }];

  if (kind === 'home') {
    path = '/';
    title = `${SITE.name} · ${SITE.tagline}`;
    description = HOME_COPY.description;
    schema = 'home';
  } else if (kind === 'hub') {
    const vol = input.vol || record?.vol;
    path = `/${vol}/`;
    const copy = VOLUME_COPY[vol];
    title = `${copy.title} · ${SITE.name}`;
    description = copy.description;
    breadcrumbs.push({ name: copy.title, path });
    schema = 'hub';
  } else if (kind === 'chapter' && record) {
    path = canonicalPath(record);
    const name = shortTitle(record);
    title = `${name} · ${VOLUME_NAME[record.vol]} · ${SITE.name}`;
    description = chapterDescription(record, articleMetadata);
    socialType = 'article';
    breadcrumbs.push({ name: VOLUME_NAME[record.vol], path: `/${record.vol}/` });
    breadcrumbs.push({ name, path });
    schema = 'article';
  } else if (kind === 'methods') {
    path = '/methods/';
    title = `${METHODS_COPY.title} · ${SITE.name}`;
    description = METHODS_COPY.description;
    breadcrumbs.push({ name: 'Methods', path });
    schema = 'methods';
  } else if (kind === 'glossary') {
    path = '/glossary/';
    title = `${DISCOVERY_COPY.glossary.title} · ${SITE.name}`;
    description = DISCOVERY_COPY.glossary.description;
    breadcrumbs.push({ name: 'Glossary', path });
    schema = 'glossary';
  } else if (kind === 'search') {
    path = '/search/';
    title = `${SEARCH_COPY.title} · ${SITE.name}`;
    description = SEARCH_COPY.description;
    schema = 'search';
  } else if (kind === 'error') {
    path = '/404';
    title = `${NOT_FOUND_COPY.title} · ${SITE.name}`;
    description = NOT_FOUND_COPY.description;
    schema = 'error';
  } else if (DISCOVERY_COPY[kind]) {
    path = `/${kind}/`;
    title = `${DISCOVERY_COPY[kind].title.replace(/\.$/, '')} · ${SITE.name}`;
    description = DISCOVERY_COPY[kind].description;
    breadcrumbs.push({ name: kind[0].toUpperCase() + kind.slice(1), path });
    schema = 'discovery';
  } else {
    path = path || '/';
    title = `${SITE.name} · ${SITE.tagline}`;
    description = HOME_COPY.description;
  }

  const indexable = input.indexable ?? status.indexable;
  const robots = input.robots || (indexable ? 'index, follow' : 'noindex, follow');
  const canonical = kind === 'error' ? absoluteUrl('/') : absoluteUrl(path);
  const image = socialImageUrl();
  return {
    kind,
    pageType,
    path: kind === 'error' ? '/404' : path,
    canonical,
    title,
    description,
    robots,
    indexable,
    socialType,
    image,
    imageAlt: SITE.socialImageAlt,
    imageWidth: SITE.socialImageWidth,
    imageHeight: SITE.socialImageHeight,
    breadcrumbs,
    schema,
    record,
    vol: input.vol || record?.vol || null,
    headline: record ? shortTitle(record) : title.replace(` · ${SITE.name}`, ''),
    citations: articleMetadata[record?.id]?.citations || [],
  };
}

export function jsonLdGraph(page, extras = {}) {
  const graph = [];
  if (page.schema === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${page.canonical}#website`,
      url: page.canonical,
      name: SITE.name,
      inLanguage: SITE.language,
      description: page.description,
    });
    graph.push({
      '@type': 'WebPage',
      '@id': `${page.canonical}#webpage`,
      url: page.canonical,
      name: page.title,
      isPartOf: { '@id': `${page.canonical}#website` },
      inLanguage: SITE.language,
    });
  } else if (page.schema === 'hub' || page.schema === 'glossary' || page.schema === 'discovery') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${page.canonical}#page`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: SITE.language,
    });
    if (extras.itemList?.length) {
      graph.push({
        '@type': 'ItemList',
        '@id': `${page.canonical}#items`,
        itemListElement: extras.itemList.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: item.url,
          name: item.name,
        })),
      });
    }
  } else if (page.schema === 'article') {
    const article = {
      '@type': 'Article',
      '@id': `${page.canonical}#article`,
      headline: page.headline,
      description: page.description,
      mainEntityOfPage: { '@type': 'WebPage', '@id': page.canonical },
      inLanguage: SITE.language,
      url: page.canonical,
    };
    if (extras.datePublished) article.datePublished = extras.datePublished;
    if (extras.dateModified) article.dateModified = extras.dateModified;
    if (page.citations?.length) {
      article.citation = uniqueCitations(page.citations).map(citation => ({
        '@type': 'CreativeWork',
        name: citation.title,
        url: citation.url,
      }));
    }
    graph.push(article);
  } else if (page.schema === 'methods') {
    graph.push({
      '@type': 'AboutPage',
      '@id': `${page.canonical}#page`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: SITE.language,
    });
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': `${page.canonical}#page`,
      url: page.canonical,
      name: page.title,
      inLanguage: SITE.language,
    });
  }
  if (page.breadcrumbs?.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function uniqueCitations(citations = []) {
  const seen = new Set();
  const out = [];
  for (const citation of citations) {
    const key = `${citation.claimId || ''}|${citation.url}|${citation.locator}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(citation);
  }
  return out;
}

export function applyDocumentMeta(html, page, extras = {}) {
  const graph = jsonLdGraph(page, extras);
  const json = JSON.stringify(graph).replace(/</g, '\\u003c');
  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(page.description)}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(page.title)}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(page.description)}">`],
    [/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${escapeHtml(page.socialType)}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHtml(page.canonical)}">`],
    [/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeHtml(page.image)}">`],
    [/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeHtml(page.image)}">`],
    [/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHtml(page.canonical)}">`],
  ];
  let out = html;
  for (const [pattern, value] of replacements) out = out.replace(pattern, value);
  if (/<meta name="robots" content="[^"]*">/.test(out)) {
    out = out.replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${escapeHtml(page.robots)}">`);
  } else {
    out = out.replace('<meta name="description"', `<meta name="robots" content="${escapeHtml(page.robots)}">\n<meta name="description"`);
  }
  if (!/<meta name="twitter:title"/.test(out)) {
    out = out.replace(
      '<meta name="twitter:card"',
      `<meta name="twitter:title" content="${escapeHtml(page.title)}">\n<meta name="twitter:description" content="${escapeHtml(page.description)}">\n<meta name="twitter:card"`,
    );
  } else {
    out = out.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(page.title)}">`);
    out = out.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(page.description)}">`);
  }
  const imageExtras = [
    `<meta property="og:image:width" content="${page.imageWidth}">`,
    `<meta property="og:image:height" content="${page.imageHeight}">`,
    `<meta property="og:image:alt" content="${escapeHtml(page.imageAlt)}">`,
  ].join('\n');
  if (/<meta property="og:image:width"/.test(out)) {
    out = out.replace(/<meta property="og:image:width" content="[^"]*">/, `<meta property="og:image:width" content="${page.imageWidth}">`);
    out = out.replace(/<meta property="og:image:height" content="[^"]*">/, `<meta property="og:image:height" content="${page.imageHeight}">`);
    out = out.replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${escapeHtml(page.imageAlt)}">`);
  } else {
    out = out.replace('<meta property="og:image"', `${imageExtras}\n<meta property="og:image"`);
  }
  const jsonTag = `<script type="application/ld+json">${json}</script>`;
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(out)) {
    out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonTag);
  } else {
    out = out.replace('</head>', `${jsonTag}\n</head>`);
  }
  return out;
}

export function applyClientMeta(page, extras = {}) {
  if (typeof document === 'undefined') return;
  document.title = page.title;
  setMeta('name', 'description', page.description);
  setMeta('name', 'robots', page.robots);
  setMeta('property', 'og:title', page.title);
  setMeta('property', 'og:description', page.description);
  setMeta('property', 'og:type', page.socialType);
  setMeta('property', 'og:url', page.canonical);
  setMeta('property', 'og:image', page.image);
  setMeta('property', 'og:image:width', String(page.imageWidth));
  setMeta('property', 'og:image:height', String(page.imageHeight));
  setMeta('property', 'og:image:alt', page.imageAlt);
  setMeta('name', 'twitter:title', page.title);
  setMeta('name', 'twitter:description', page.description);
  setMeta('name', 'twitter:image', page.image);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', page.canonical);
  let script = document.querySelector('script[type="application/ld+json"][data-seo="page"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'page';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLdGraph(page, extras)).replace(/</g, '\\u003c');
}

function setMeta(attribute, name, content) {
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function sitemapXml(pages) {
  const urls = pages.filter(page => page.indexable && page.kind !== 'redirect' && page.kind !== 'error')
    .map(page => `  <url><loc>${escapeHtml(page.canonical)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Search crawlers may fetch published HTML. Training-crawler access is not',
    '# inferred from this allow rule; see /methods/#crawlers.',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml').replace(/\/$/, '')}`,
    '',
  ].join('\n');
}

export function indexablePages(manifest, articleMetadata) {
  const pages = [
    resolvePage({ kind: 'home' }),
    ...VOLUME_IDS.map(vol => resolvePage({ kind: 'hub', vol })),
    resolvePage({ kind: 'methods' }),
    resolvePage({ kind: 'glossary' }),
  ];
  for (const record of manifest) {
    if (isDirectoryRecord(record)) continue;
    pages.push(resolvePage({ kind: 'chapter', record, articleMetadata }));
  }
  return pages.filter(page => page.indexable);
}

export { VOLUME_NAME, VOLUME_ROMAN };
