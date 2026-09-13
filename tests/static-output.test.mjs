import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

test('each article has a direct HTML page with unique canonical metadata', () => {
  for (const record of manifest) {
    const path = join(root, 'dist', record.vol, record.slug, 'index.html');
    assert.ok(existsSync(path), record.id);
    const html = readFileSync(path, 'utf8');
    const url = `https://money-research-iota.vercel.app/${record.vol}/${record.slug}/`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), record.id);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), record.id);
    assert.ok(html.includes('<meta name="description"'), record.id);
    assert.ok(html.includes('<main class="static-article">'), record.id);
    assert.ok(html.includes('<h1 id="'), record.id);
    for (const alias of record.aliases) {
      const aliasPath = join(root, 'dist', record.vol, alias, 'index.html');
      assert.ok(existsSync(aliasPath), `${record.id} alias ${alias}`);
      assert.ok(readFileSync(aliasPath, 'utf8').includes(`<link rel="canonical" href="${url}">`));
    }
  }
});

test('sitemap covers the homepage and all 44 article routes', () => {
  const xml = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
  assert.equal((xml.match(/<url>/g) || []).length, 45);
  for (const record of manifest) assert.ok(xml.includes(`/${record.vol}/${record.slug}/`), record.id);
});
