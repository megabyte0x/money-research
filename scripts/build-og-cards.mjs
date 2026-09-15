import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import {
  OG_CARD_FONT_FAMILY, OG_CARD_HEIGHT, OG_CARD_TEMPLATE_VERSION, OG_CARD_WIDTH,
  ogCardDefinition, ogCardTree,
} from '../src/og-card.js';
import { routeInventory } from '../src/routes.js';
import { SITE } from '../src/site-config.js';
import { resolvePageContent } from '../src/seo.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputDir = join(root, 'public', 'og');
const generatedDir = join(root, 'src', 'generated');
const fontPath = join(root, 'node_modules', '@fontsource', 'ibm-plex-sans', 'files', 'ibm-plex-sans-latin-600-normal.woff');
const font = readFileSync(fontPath);
const fontHash = createHash('sha256').update(font).digest('hex');
const model = JSON.parse(readFileSync(join(root, 'public', 'content', 'index.json'), 'utf8'));

mkdirSync(outputDir, { recursive: true });
mkdirSync(generatedDir, { recursive: true });

function contentForRoute(route) {
  if (route.kind === 'hub') {
    const record = model.manifest.find(item => item.vol === route.vol && item.slug === '00-readme');
    return resolvePageContent({ kind: 'hub', vol: route.vol, record, articleMetadata: model.articleMetadata });
  }
  if (route.kind === 'chapter') {
    return resolvePageContent({ kind: 'chapter', record: route.record, articleMetadata: model.articleMetadata });
  }
  return resolvePageContent({ kind: route.kind });
}

function filenameFor(path) {
  if (path === '/') return 'home';
  if (path === '/404') return 'not-found';
  return path.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'card';
}

function contentHash(card) {
  return createHash('sha256').update(JSON.stringify({
    title: card.title,
    volume: card.volume,
    templateVersion: OG_CARD_TEMPLATE_VERSION,
    fontHash,
  })).digest('hex').slice(0, 12);
}

function assertPng(buffer, label) {
  const signature = buffer.subarray(0, 8).toString('hex');
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (signature !== '89504e470d0a1a0a' || width !== OG_CARD_WIDTH || height !== OG_CARD_HEIGHT) {
    throw new Error(`${label}: renderer did not produce a ${OG_CARD_WIDTH}×${OG_CARD_HEIGHT} PNG`);
  }
  if (buffer.length >= 500 * 1024) throw new Error(`${label}: PNG exceeds the 500 KB delivery budget`);
}

const routes = routeInventory(model.manifest).filter(route => route.kind !== 'redirect');
const cards = {};
for (const route of routes) {
  const page = contentForRoute(route);
  const card = ogCardDefinition(page);
  const hash = contentHash(card);
  const image = `/og/${filenameFor(page.path)}.${hash}.png`;
  const svg = await satori(ogCardTree(card), {
    width: OG_CARD_WIDTH,
    height: OG_CARD_HEIGHT,
    fonts: [{ name: OG_CARD_FONT_FAMILY, data: font, weight: 600, style: 'normal' }],
  });
  const png = new Resvg(svg, { background: '#121211' }).render().asPng();
  assertPng(png, page.path);
  writeFileSync(join(root, 'public', image), png);
  cards[page.path] = { image, alt: card.alt, title: card.title, volume: card.volume, templateVersion: card.templateVersion };
}

const manifest = {
  templateVersion: OG_CARD_TEMPLATE_VERSION,
  width: OG_CARD_WIDTH,
  height: OG_CARD_HEIGHT,
  cards,
};
writeFileSync(join(generatedDir, 'og-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// Keep Vite's unprerendered home document coherent too. The static prerenderer
// applies the same values to every route after Vite has built the application.
const home = cards['/'];
const templatePath = join(root, 'index.html');
let template = readFileSync(templatePath, 'utf8');
template = template
  .replace(/(<meta property="og:image" content=")[^"]*(">)/, `$1${SITE.origin}${home.image}$2`)
  .replace(/(<meta property="og:image:alt" content=")[^"]*(">)/, `$1${home.alt}$2`)
  .replace(/(<meta name="twitter:image" content=")[^"]*(">)/, `$1${SITE.origin}${home.image}$2`)
  .replace(/(<meta name="twitter:image:alt" content=")[^"]*(">)/, `$1${home.alt}$2`);
writeFileSync(templatePath, template);

const totalBytes = Object.values(cards).reduce((total, card) => total + statSync(join(root, 'public', card.image)).size, 0);
console.log(`Generated ${Object.keys(cards).length} title cards (${Math.round(totalBytes / 1024)} KB total)`);
