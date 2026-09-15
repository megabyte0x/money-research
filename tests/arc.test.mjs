import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('src/App.jsx', root), 'utf8');
const history = readFileSync(new URL('src/features/reader/HistoryView.jsx', root), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('public/content/manifest.json', root), 'utf8'));
const arc = source.match(/static ARC = \[([\s\S]*?)\];/)[1];

test('arc metadata and reading stages have the same eleven-item order', () => {
  const navigation = [...arc.matchAll(/\{ n: (?:'([^']+)'|(\d+)), label:/g)]
    .map(([, name, number]) => `arc-${name || number}`);
  const stages = [...history.matchAll(/\{ id: '(arc-[^']+)', era:/g)].map(([, id]) => id);
  assert.equal(navigation.length, 11);
  assert.deepEqual(stages, navigation);
  assert.ok(stages.indexOf('arc-4') < stages.indexOf('arc-interwar'));
  assert.ok(stages.indexOf('arc-interwar') < stages.indexOf('arc-5'));
  assert.equal(stages.at(-1), 'arc-digital');
});

test('direct article references in the arc resolve to published records', () => {
  const published = new Set(manifest.map(record => `/${record.vol}/${record.slug}/`));
  for (const [, path] of history.matchAll(/href: '(\/(?:gold|after|bitcoin)\/[^']+)'/g)) {
    assert.ok(published.has(path), `${path} is not a published article`);
  }
});

test('published arc does not collapse gold-standard credit or universalise regional history', () => {
  assert.match(history, /bank deposits and credit remained/i);
  assert.match(history, /different regional roles/i);
  assert.match(history, /Many central banks adopted more explicit policy frameworks/i);
  assert.match(history, /Quantitative charts are withheld/i);
  assert.doesNotMatch(history, /money supply grew as fast as gold was mined|first inflation|first bimetallic standard|silver pennies only|almost everyone by 2000/i);
});
