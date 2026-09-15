import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/site-config.js';
import {
  canonicalPath, isDirectoryRecord, redirectRules, vercelConfig, VOLUME_IDS,
} from '../src/routes.js';
import { applyDocumentMeta, indexablePages, resolvePage, robotsTxt, sitemapXml } from '../src/seo.js';
import {
  hubItemList, staticArc, staticArticle, staticCompare, staticGlossary, staticHome,
  staticMechanics, staticMethods, staticNotFound, staticSearch, staticTakeaways,
  staticTimeline, wrapStatic,
} from '../src/static-pages.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const model = JSON.parse(readFileSync(join(root, 'public/content/index.json'), 'utf8'));
const template = readFileSync(join(dist, 'index.html'), 'utf8');

function writePage(relDir, inner, page, extras = {}) {
  const html = applyDocumentMeta(template, page, extras)
    .replace('<div id="root"></div>', `<div id="root">${wrapStatic(inner)}</div>`);
  const output = relDir ? join(dist, relDir) : dist;
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'index.html'), html);
}

writePage('', staticHome(model.manifest, resolvePage({ kind: 'home' })), resolvePage({ kind: 'home' }), {
  itemList: VOLUME_IDS.map(vol => ({ name: vol, url: `${SITE.origin}/${vol}/` })),
});

for (const vol of VOLUME_IDS) {
  const record = model.manifest.find(item => item.vol === vol && isDirectoryRecord(item));
  const page = resolvePage({ kind: 'hub', vol, record, articleMetadata: model.articleMetadata });
  const extras = { itemList: hubItemList(vol, model.manifest) };
  writePage(vol, staticArticle(record, model, page), page, extras);
}

for (const record of model.manifest) {
  if (isDirectoryRecord(record)) continue;
  const page = resolvePage({ kind: 'chapter', record, articleMetadata: model.articleMetadata });
  writePage(join(record.vol, record.slug), staticArticle(record, model, page), page);
}

const methodsPage = resolvePage({ kind: 'methods' });
writePage('methods', staticMethods(methodsPage), methodsPage);

const glossaryPage = resolvePage({ kind: 'glossary' });
writePage('glossary', staticGlossary(model.glossary, glossaryPage), glossaryPage, {
  itemList: model.glossary.slice(0, 40).map(term => ({ name: term.term, url: `${SITE.origin}/glossary/#${term.id}` })),
});

const timelinePage = resolvePage({ kind: 'timeline' });
writePage('timeline', staticTimeline(model, timelinePage), timelinePage);

const takeawaysPage = resolvePage({ kind: 'takeaways' });
writePage('takeaways', staticTakeaways(model.manifest, model.articleMetadata, takeawaysPage), takeawaysPage, {
  itemList: Object.entries(model.articleMetadata).map(([id, meta]) => {
    const article = model.manifest.find(item => item.id === id);
    return article && meta.summary?.question ? { name: meta.summary.question, url: `${SITE.origin}${canonicalPath(article)}` } : null;
  }).filter(Boolean),
});

const mechanicsPage = resolvePage({ kind: 'mechanics' });
writePage('mechanics', staticMechanics(mechanicsPage), mechanicsPage);

const comparePage = resolvePage({ kind: 'compare' });
writePage('compare', staticCompare(model, comparePage), comparePage);

const arcPage = resolvePage({ kind: 'arc' });
writePage('arc', staticArc(arcPage), arcPage);

const searchPage = resolvePage({ kind: 'search' });
writePage('search', staticSearch(searchPage), searchPage);

const notFoundPage = resolvePage({ kind: 'error' });
const notFoundHtml = applyDocumentMeta(template, notFoundPage)
  .replace('<div id="root"></div>', `<div id="root">${wrapStatic(staticNotFound(notFoundPage))}</div>`);
writeFileSync(join(dist, '404.html'), notFoundHtml);

writeFileSync(join(dist, 'sitemap.xml'), sitemapXml(indexablePages(model.manifest, model.articleMetadata)));
writeFileSync(join(dist, 'robots.txt'), robotsTxt());
writeFileSync(join(root, 'vercel.json'), JSON.stringify(vercelConfig(model.manifest), null, 2) + '\n');
writeFileSync(join(dist, 'redirects.json'), JSON.stringify(redirectRules(model.manifest), null, 2) + '\n');

const articleCount = model.manifest.filter(record => !isDirectoryRecord(record)).length;
console.log(`Generated ${articleCount} chapter pages, hubs, discovery routes, robots.txt and sitemap.xml`);
