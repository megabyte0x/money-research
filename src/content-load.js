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
  const pending = [];
  const manifest = state.manifest || [];
  const record = recordForRoute(route, manifest);
  const records = record ? [record] : ['sources', 'timeline'].includes(route.view)
    ? manifest.filter(entry => sharedViewForRecord(entry) === route.view) : [];
  const missing = records.filter(item => !state.blocks?.[`${item.slug}@${item.vol}`]);
  if (missing.length) {
    pending.push(Promise.all(missing.map(item => loadArticleBlocks(item.id))).then(loaded => {
      next.blocks = { ...state.blocks };
      missing.forEach((item, index) => {
        next.blocks[`${item.slug}@${item.vol}`] = loaded[index];
      });
    }));
  }
  if (['article', 'hub', 'glossary', 'takeaways', 'sources'].includes(route.view) && !state.readerLoaded) {
    pending.push(loadJson('content/reader.json').then(reader => {
      next.glossary = reader.glossary;
      next.articleMetadata = reader.articleMetadata;
      next.readerLoaded = true;
    }));
  }
  if (route.view === 'search' && !state.searchIndexLoaded) {
    pending.push(loadSearchIndex().then(blocks => {
      next.blocks = { ...state.blocks, ...blocks };
      next.searchIndexLoaded = true;
    }));
  }
  if ((route.view === 'timeline' || route.view === 'compare') && !state.discoveryLoaded) {
    pending.push(loadDiscovery().then(discovery => {
      next.timelineReviewStatus = discovery.timelineReviewStatus || {};
      next.comparisonCells = discovery.comparisonCells || {};
      next.observations = discovery.observations || {};
      next.sources = discovery.sources || {};
      next.claims = discovery.claims || {};
      next.discoveryLoaded = true;
    }));
  }
  await Promise.all(pending);
  return next;
}
