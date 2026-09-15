import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listenHost } from '../scripts/host-server.mjs';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const ogManifest = JSON.parse(readFileSync(join(root, 'src/generated/og-manifest.json'), 'utf8'));

async function request(port, path, method = 'GET') {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { method, redirect: 'manual' });
  const body = await response.text();
  return { status: response.status, headers: Object.fromEntries(response.headers), body };
}

test('host config serves canonical pages, alias redirects, versioned cards, 404s and content headers', async () => {
  const { server, port } = await listenHost(dist, vercel);
  try {
    const home = await request(port, '/');
    assert.equal(home.status, 200);
    assert.match(home.body, /How money works/);
    const chapter = await request(port, '/gold/03-from-metal-to-money-weights-rings-coins/');
    assert.equal(chapter.status, 200);
    assert.match(chapter.headers['content-type'], /text\/html/);
    const alias = await request(port, '/bitcoin/01/');
    assert.equal(alias.status, 308);
    assert.equal(alias.headers.location, '/bitcoin/01-the-origin-what-2008-produced/');
    const intro = await request(port, '/gold/00-readme/');
    assert.equal(intro.status, 308);
    assert.equal(intro.headers.location, '/gold/');
    const glossary = await request(port, '/gold/11-glossary/');
    assert.equal(glossary.status, 308);
    assert.equal(glossary.headers.location, '/glossary/');
    const sources = await request(port, '/after/13-sources/');
    assert.equal(sources.status, 308);
    assert.equal(sources.headers.location, '/sources/');
    const timeline = await request(port, '/bitcoin/14-master-timeline-2008-2026/');
    assert.equal(timeline.status, 308);
    assert.equal(timeline.headers.location, '/timeline/');
    const missing = await request(port, '/not-a-published-page/');
    assert.equal(missing.status, 404);
    assert.match(missing.body, /Page not found/);
    const robots = await request(port, '/robots.txt');
    assert.equal(robots.status, 200);
    assert.match(robots.body, /Sitemap:/);
    const sitemap = await request(port, '/sitemap.xml');
    assert.equal(sitemap.status, 200);
    assert.match(sitemap.headers['content-type'], /xml/);
    const imagePath = ogManifest.cards['/'].image;
    const image = await request(port, imagePath);
    assert.equal(image.status, 200);
    assert.match(image.headers['content-type'], /image\/png/);
    assert.equal(image.headers['cache-control'], 'public, max-age=31536000, immutable');
    const missingImage = await request(port, '/og/not-a-card.png');
    assert.equal(missingImage.status, 404);
    assert.notEqual(missingImage.status, 200);
    const raw = await request(port, '/content/index.json');
    assert.equal(raw.status, 200);
    assert.equal(raw.headers['x-robots-tag'], 'noindex');
    const markdown = await request(port, '/content/gold/01-the-metal-itself.md');
    assert.equal(markdown.status, 200);
    assert.equal(markdown.headers['x-robots-tag'], 'noindex');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
