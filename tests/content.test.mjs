import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseMd } from '../src/md.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));

test('the three-volume inventory has 44 unique, resolvable records', () => {
  assert.deepEqual(Object.fromEntries(['gold', 'after', 'bitcoin'].map(vol =>
    [vol, manifest.filter(record => record.vol === vol).length])), { gold: 13, after: 14, bitcoin: 17 });
  const ids = manifest.map(record => `${record.vol}-${record.num}`);
  assert.equal(new Set(ids).size, 44);
  assert.equal(new Set(manifest.map(record => `${record.vol}/${record.slug}`)).size, 44);
  for (const record of manifest) {
    assert.match(record.path, /^content\/(gold|after|bitcoin)\/[a-z0-9-]+\.md$/);
    assert.ok(existsSync(join(root, 'public', record.path)), record.path);
    assert.ok(record.title && Number.isInteger(record.words) && record.words > 0);
  }
});

test('reviewed timeline links point to relevant existing sections', () => {
  for (const [vol, num, section, expected] of [
    ['after', '06', '9-11-afghanistan-and-iraq-2001-21', 'Iraq'],
    ['after', '05', 'the-asian-financial-crisis-1997-98', 'Asian financial crisis']
  ]) {
    const record = manifest.find(m => m.vol === vol && m.num === num);
    const blocks = parseMd(readFileSync(join(root, 'public', record.path), 'utf8'));
    const heading = blocks.find(b => b.id === section);
    assert.ok(heading, `${vol}/${num}/${section}`);
    assert.match(heading.text, new RegExp(expected, 'i'));
  }
});

test('all volumes retain a source list and a source timeline', () => {
  for (const vol of ['gold', 'after', 'bitcoin']) {
    assert.ok(manifest.some(m => m.vol === vol && m.slug.includes('sources')));
    assert.ok(manifest.some(m => m.vol === vol && m.slug.includes('timeline')));
  }
});
