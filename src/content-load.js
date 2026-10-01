import { findRecord, sharedViewForRecord } from './routes.js';

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';

async function loadJson(path) {
  const response = await fetch(BASE + path);
  if (!response.ok) throw new Error(`${path} unavailable: ${response.status}`);
  return response.json();
}

export function loadShell() {
  return loadJson('content/shell.json');
}

export async function loadArticleBlocks(id) {
  const data = await loadJson(`content/articles/${id}.json`);
  return data.blocks;
}

export async function loadSearchIndex() {
  const data = await loadJson('content/search-index.json');
  return data.blocks;
}

export function loadDiscovery() {
  return loadJson('content/discovery.json');
}

export function recordForRoute(route, manifest = []) {
  if (route.view === 'hub') return manifest.find(item => item.vol === route.vol && item.slug === '00-readme') || null;
  if (route.view === 'article') {
    return findRecord(manifest, route.vol, route.slug);
  }
  return null;
}

export async function loadRoutePayload(route, state) {
  const next = {};
  const manifest = state.manifest || [];
  const record = recordForRoute(route, manifest);
  if (record) {
    const key = `${record.slug}@${record.vol}`;
    if (!state.blocks?.[key]) {
      const blocks = { ...(state.blocks || {}) };
      blocks[key] = await loadArticleBlocks(record.id);
      next.blocks = blocks;
    }
  }
  if (route.view === 'sources' || route.view === 'timeline') {
    const blocks = { ...(next.blocks || state.blocks || {}) };
    const missing = manifest.filter(entry => sharedViewForRecord(entry) === route.view && !blocks[`${entry.slug}@${entry.vol}`]);
    const loaded = await Promise.all(missing.map(item => loadArticleBlocks(item.id)));
    missing.forEach((item, index) => {
      const key = `${item.slug}@${item.vol}`;
      blocks[key] = loaded[index];
    });
    next.blocks = blocks;
  }
  if (route.view === 'search' && !state.searchIndexLoaded) {
    next.blocks = { ...(next.blocks || state.blocks || {}), ...(await loadSearchIndex()) };
    next.searchIndexLoaded = true;
  }
  if ((route.view === 'timeline' || route.view === 'compare') && !state.discoveryLoaded) {
    const discovery = await loadDiscovery();
    next.timelineReviewStatus = discovery.timelineReviewStatus || {};
    next.comparisonCells = discovery.comparisonCells || {};
    next.observations = discovery.observations || {};
    next.discoveryLoaded = true;
  }
  return next;
}
