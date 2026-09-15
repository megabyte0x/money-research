import { SITE, absoluteUrl } from './site-config.js';

export const VOLUME_IDS = ['gold', 'after', 'bitcoin'];
export const DISCOVERY_VIEWS = ['timeline', 'takeaways', 'mechanics', 'compare', 'arc'];
export const UTILITY_VIEWS = ['search'];
const VOLUME_SET = new Set(VOLUME_IDS);
const VIEW_SET = new Set(['methods', 'glossary', 'sources', ...DISCOVERY_VIEWS, ...UTILITY_VIEWS]);

export function isDirectoryRecord(record) {
  return !!record && record.slug === '00-readme';
}

export function sharedViewForRecord(record) {
  if (!record) return null;
  if (record.slug.includes('glossary')) return 'glossary';
  if (record.slug.includes('sources')) return 'sources';
  if (record.slug.includes('timeline')) return 'timeline';
  return null;
}

export function shortTitle(record) {
  return record.title.replace(/^\d+\s+—\s+/, '').replace(/\s+—\s+Research Directory$/, '');
}

export function canonicalPath(record) {
  if (!record) return '/';
  if (isDirectoryRecord(record)) return `/${record.vol}/`;
  const sharedView = sharedViewForRecord(record);
  if (sharedView) return `/${sharedView}/`;
  return `/${record.vol}/${record.slug}/`;
}

export function articleHref(record, section) {
  const path = canonicalPath(record);
  if (!section) return path;
  return `${path}#${encodeURIComponent(section)}`;
}

export function viewPath(view, section) {
  if (!view || view === 'home') return section ? `/#${section}` : '/';
  const path = `/${view}/`;
  return section ? `${path}#${encodeURIComponent(section)}` : path;
}

export function findRecord(manifest, vol, slug) {
  if (!manifest) return null;
  return manifest.find(record => record.vol === vol && (record.slug === slug || record.aliases?.includes(slug))) || null;
}

export function publicationStatus(kind, record) {
  if (kind === 'search' || kind === 'error') {
    return { indexable: false, robots: 'noindex, follow', disposition: 'utility' };
  }
  if (DISCOVERY_VIEWS.includes(kind)) {
    return {
      indexable: false,
      robots: 'noindex, follow',
      disposition: 'prebuilt; indexing waits on editorial disposition',
    };
  }
  if (record && isDirectoryRecord(record)) {
    return { indexable: false, robots: 'noindex, follow', disposition: 'redirects to volume hub' };
  }
  return { indexable: true, robots: 'index, follow', disposition: 'published canonical' };
}

export function routeInventory(manifest = []) {
  const pages = [
    { id: 'home', path: '/', kind: 'home', indexable: true, intent: 'Understand what the library covers and choose a volume or question.', question: 'How does money work, and where should I start?' },
    { id: 'methods', path: '/methods/', kind: 'methods', indexable: true, intent: 'See how claims, sources, corrections and crawlers are handled.', question: 'How is this research produced and limited?' },
    { id: 'glossary', path: '/glossary/', kind: 'glossary', indexable: true, intent: 'Look up a term used in the volumes.', question: 'What does this monetary term mean here?' },
    { id: 'sources', path: '/sources/', kind: 'sources', indexable: true, intent: 'Browse the combined source lists and further reading for all three volumes.', question: 'What sources underpin this research?' },
    { id: 'timeline', path: '/timeline/', kind: 'timeline', indexable: false, intent: 'Scan dated events across the three volumes.', question: 'What happened, in order, across these monetary systems?' },
    { id: 'takeaways', path: '/takeaways/', kind: 'takeaways', indexable: false, intent: 'Browse approved chapter answers.', question: 'What short answer does each chapter give?' },
    { id: 'mechanics', path: '/mechanics/', kind: 'mechanics', indexable: false, intent: 'Separate a loan, a payment, a bond and QE.', question: 'How is money created and moved in these four transactions?' },
    { id: 'compare', path: '/compare/', kind: 'compare', indexable: false, intent: 'Compare arrangements by use after evidence review.', question: 'What does the accepted evidence support for this use?' },
    { id: 'arc', path: '/arc/', kind: 'arc', indexable: false, intent: 'Follow selected monetary arrangements over time.', question: 'How did monetary arrangements overlap and change?' },
    { id: 'search', path: '/search/', kind: 'search', indexable: false, intent: 'Find a passage or glossary term.', question: 'Where is this term discussed?' },
    { id: 'notfound', path: '/404', kind: 'error', indexable: false, intent: 'Recover from a missing URL.', question: 'Is this a Money Research page?' },
  ];
  for (const vol of VOLUME_IDS) {
    pages.push({
      id: `hub-${vol}`,
      path: `/${vol}/`,
      kind: 'hub',
      vol,
      indexable: true,
      intent: `Open the ${vol} volume introduction and its chapters.`,
      question: vol === 'gold'
        ? 'How did gold become money and what role remains?'
        : vol === 'after'
          ? 'What changed after official gold conversion ended?'
          : 'What did Bitcoin solve and what remains unsettled?',
    });
  }
  for (const record of manifest) {
    if (isDirectoryRecord(record)) {
      pages.push({
        id: record.id,
        path: canonicalPath(record),
        kind: 'redirect',
        record,
        indexable: false,
        intent: 'Legacy volume introduction URL.',
        question: null,
        redirectsTo: `/${record.vol}/`,
      });
      continue;
    }
    const sharedView = sharedViewForRecord(record);
    if (sharedView) {
      pages.push({
        id: `redirect-${record.id}`,
        path: `/${record.vol}/${record.slug}/`,
        kind: 'redirect',
        record,
        indexable: false,
        intent: `Former volume-specific ${sharedView} page.`,
        question: null,
        redirectsTo: `/${sharedView}/`,
      });
      continue;
    }
    pages.push({
      id: record.id,
      path: canonicalPath(record),
      kind: 'chapter',
      record,
      indexable: true,
      intent: 'Read the chapter’s approved answer, explanation, sources and limits.',
      question: null,
    });
  }
  return pages;
}

export function redirectRules(manifest = []) {
  const rules = [];
  for (const record of manifest) {
    const dest = canonicalPath(record);
    if (isDirectoryRecord(record)) {
      rules.push({ source: `/${record.vol}/00-readme/`, destination: dest, permanent: true });
    }
    if (sharedViewForRecord(record)) {
      rules.push({ source: `/${record.vol}/${record.slug}/`, destination: dest, permanent: true });
    }
    for (const alias of record.aliases || []) {
      const from = `/${record.vol}/${alias}/`;
      if (from === dest) continue;
      rules.push({ source: from, destination: dest, permanent: true });
    }
  }
  return rules;
}

export function vercelConfig(manifest = []) {
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    trailingSlash: true,
    redirects: redirectRules(manifest),
    headers: [
      {
        source: '/content/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/og/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ],
  };
}

export function parseLocation(location, manifest = []) {
  const url = toUrl(location);
  const parts = url.pathname.split('/').filter(Boolean);
  const section = (url.hash.replace(/^#/, '') || url.searchParams.get('section') || '').trim() || null;
  const query = url.searchParams.get('q') || '';
  const volume = VOLUME_SET.has(url.searchParams.get('vol')) ? url.searchParams.get('vol') : '';
  if (parts.length === 0) return { view: 'home', sec: section, query, searchVol: volume };
  if (parts.length === 1 && VIEW_SET.has(parts[0])) {
    return {
      view: parts[0],
      sec: section,
      query,
      searchVol: volume,
      compareUse: url.searchParams.get('use') || '',
      comparePerspective: url.searchParams.get('perspective') || '',
      summaryVolume: volume,
      summaryTopic: url.searchParams.get('topic') || '',
    };
  }
  if (parts.length === 1 && VOLUME_SET.has(parts[0])) {
    return { view: 'hub', vol: parts[0], slug: '00-readme', sec: section };
  }
  if (parts.length >= 2 && VOLUME_SET.has(parts[0])) {
    const record = findRecord(manifest, parts[0], parts[1]);
    if (record && isDirectoryRecord(record)) return { view: 'hub', vol: parts[0], slug: record.slug, sec: section };
    const sharedView = sharedViewForRecord(record);
    if (sharedView) return { view: sharedView, sec: section };
    if (record) return { view: 'article', vol: record.vol, slug: record.slug, sec: section };
    if (!manifest.length) return { view: 'article', vol: parts[0], slug: parts[1], sec: section };
    return { view: 'notfound', sec: section };
  }
  return { view: 'notfound', sec: section };
}

export function hashToPath(hash, manifest = []) {
  if (!hash || !hash.startsWith('#/')) return null;
  const [pathPart, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const seg = pathPart.split('/').filter(Boolean);
  const q = query ? `?${query}` : '';
  if (!seg.length || seg[0] === 'home') {
    return seg[1] ? `/#${seg[1]}` : '/';
  }
  if (['research', 'paths'].includes(seg[0])) return '/';
  if (VIEW_SET.has(seg[0])) {
    const path = `/${seg[0]}/`;
    if (seg[1]) return `${path}${q}#${encodeURIComponent(seg[1])}`;
    return path + q;
  }
  if (VOLUME_SET.has(seg[0]) && seg[1]) {
    const record = findRecord(manifest, seg[0], seg[1]);
    const path = record ? canonicalPath(record) : `/${seg[0]}/${seg[1]}/`;
    if (seg[2]) return `${path}#${encodeURIComponent(seg[2])}`;
    return path;
  }
  return '/';
}

export function translateLegacyHash(location, history, manifest = []) {
  const loc = location || (typeof window !== 'undefined' ? window.location : null);
  const hist = history || (typeof window !== 'undefined' ? window.history : null);
  if (!loc || !hist || !loc.hash?.startsWith('#/')) return false;
  const dest = hashToPath(loc.hash, manifest);
  if (!dest) return false;
  const next = dest.startsWith('http') ? dest : dest;
  hist.replaceState(hist.state, '', next);
  return true;
}

function toUrl(location) {
  if (!location) return new URL('/', SITE.origin);
  if (typeof location === 'string') return new URL(location, SITE.origin);
  const path = location.pathname || '/';
  const search = location.search || '';
  const hash = location.hash || '';
  return new URL(path + search + hash, location.origin || SITE.origin);
}

export { absoluteUrl, SITE };
