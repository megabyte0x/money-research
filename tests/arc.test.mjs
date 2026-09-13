import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('src/App.jsx', root), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('public/content/manifest.json', root), 'utf8'));
const arc = source.match(/static ARC = \[([\s\S]*?)\];/)[1];
const view = source.match(/\{v\.isArc && <div className="history-arc">([\s\S]*?)\{v\.isResearch &&/)[1];

test('arc metadata and reading stages have the same eleven-item order', () => {
  const navigation = [...arc.matchAll(/\{ n: (?:'([^']+)'|(\d+)), label:/g)]
    .map(([, name, number]) => `arc-${name || number}`);
  const stages = [...view.matchAll(/<section data-stage=\{this\.arcStage\('([^']+)'\)\} id="([^"]+)"/g)]
    .map(([, stage, id]) => {
      assert.equal(stage, id);
      return id;
    });
  assert.equal(navigation.length, 11);
  assert.deepEqual(stages, navigation);
  assert.ok(stages.indexOf('arc-4') < stages.indexOf('arc-interwar'));
  assert.ok(stages.indexOf('arc-interwar') < stages.indexOf('arc-5'));
  assert.equal(stages.at(-1), 'arc-digital');
});

test('direct article references in the arc resolve to published records', () => {
  const published = new Set(manifest.map(record => `/${record.vol}/${record.slug}/`));
  for (const [, path] of view.matchAll(/href="(\/(?:gold|after|bitcoin)\/[^"#?]+)"/g)) {
    assert.ok(published.has(path), `${path} is not a published article`);
  }
});
