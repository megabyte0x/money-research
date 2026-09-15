import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseMd } from '../src/md.js';
import { searchDocuments, searchState, searchUrl } from '../src/search.js';

const manifest = JSON.parse(readFileSync(new URL('../public/content/manifest.json', import.meta.url)));
const blocks = Object.fromEntries(manifest.map(article => [
  article.slug + '@' + article.vol,
  parseMd(readFileSync(new URL('../public/' + article.path, import.meta.url), 'utf8'))
]));

test('search URL restores query and volume, including a zero-result query', () => {
  for (const query of ['Triffin dilemma', 'zzzz-no-result']) {
    const url = searchUrl(query, 'after');
    assert.deepEqual(searchState(url), { query, volume: 'after' });
  }
  assert.deepEqual(searchState('/search/?q=QE&vol=unexpected'), { query: 'QE', volume: '' });
  assert.deepEqual(searchState('#/search?q=QE&vol=bitcoin'), { query: 'QE', volume: 'bitcoin' });
});

test('Triffin ranks the canonical glossary definition above directories', () => {
  const results = searchDocuments(manifest, blocks, 'Triffin');
  assert.equal(results[0].article.id, 'gold-11');
  assert.equal(results[0].glossaryId, 'triffin-dilemma');
  assert.equal(results.filter(r => r.glossaryId === 'triffin-dilemma').length, 1);
  assert.ok(results.findIndex(r => r.article.slug.includes('readme')) !== 0);
});

test('QE and quantitative easing find the same core sections', () => {
  const short = searchDocuments(manifest, blocks, 'QE');
  const full = searchDocuments(manifest, blocks, 'quantitative easing');
  const key = r => [r.article.id, r.glossaryId || r.section];
  assert.deepEqual(short.slice(0, 2).map(key), full.slice(0, 2).map(key));
  assert.equal(short[0].glossaryId, 'quantitative-easing-qe');
  assert.equal(short[1].article.id, 'after-07');
});

test('volume filters and grouped section hits preserve relevant results', () => {
  const after = searchDocuments(manifest, blocks, 'QE', 'after');
  assert.ok(after.length > 0);
  assert.ok(after.every(result => result.article.vol === 'after'));
  const sectionKeys = after.map(result => result.article.id + '/' + (result.glossaryId || result.section));
  assert.equal(new Set(sectionKeys).size, sectionKeys.length);
  assert.ok(searchDocuments(manifest, blocks, 'money', 'after').some(result => result.matches > 1));
  assert.deepEqual(searchDocuments(manifest, blocks, 'zzzz-no-result', 'after'), []);
});
