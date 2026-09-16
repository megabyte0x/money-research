import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseMd, parseGlossary } from '../src/md.js';
import { searchDocuments, searchPhrases, searchState, searchUrl } from '../src/search.js';
import { acceptedCanonicalIds, canonicalGlossary, canonicalProposals } from '../src/features/discovery/canonical.js';
import { contentRole, learningPaths, researchCatalog, takeawayCandidates } from '../src/features/discovery/catalog.js';

const manifest = JSON.parse(readFileSync(new URL('../public/content/manifest.json', import.meta.url)));
const blocks = Object.fromEntries(manifest.map(article => [article.slug + '@' + article.vol,
  parseMd(readFileSync(new URL('../public/' + article.path, import.meta.url), 'utf8'))]));

test('discovery roles account for every document and retain late Bitcoin takeaways', () => {
  const catalog = researchCatalog(manifest);
  assert.equal(catalog.length, 62);
  assert.equal(new Set(catalog.map(row => row.id)).size, 62);
  for (const row of catalog) assert.ok(['topic', 'directory', 'timeline', 'glossary', 'sources', 'reference'].includes(row.role));
  assert.equal(contentRole(manifest.find(row => row.id === 'after-10')), 'reference');
  assert.equal(contentRole(manifest.find(row => row.id === 'zcash-14')), 'reference');
  const eligible = new Set(takeawayCandidates(manifest, blocks).map(row => row.id));
  for (const id of ['bitcoin-10', 'bitcoin-11', 'bitcoin-12', 'bitcoin-13']) assert.ok(eligible.has(id));
});

test('five reading paths resolve, have computed times and explain branches', () => {
  const paths = learningPaths(manifest);
  assert.equal(paths.length, 5);
  assert.equal(new Set(paths.map(path => path.id)).size, 5);
  for (const path of paths) {
    assert.ok(path.steps.length >= 3);
    assert.ok(path.minutes >= 1);
    assert.equal(path.minutes, Math.round(path.steps.reduce((sum, article) => sum + article.words, 0) / 230));
    assert.ok(path.branches.every(branch => branch.article && branch.why));
  }
});

test('canonical proposals govern reviewed duplicate terms while retaining other source definitions', () => {
  const raw = ['gold', 'after', 'bitcoin', 'zcash'].flatMap(vol => {
    const article = manifest.find(row => row.vol === vol && contentRole(row) === 'glossary');
    return parseGlossary(readFileSync(new URL('../public/' + article.path, import.meta.url), 'utf8')).map(term => ({ ...term, vol }));
  });
  const duplicates = [...new Set(raw.map(term => term.id))].filter(id => raw.filter(term => term.id === id).length > 1);
  assert.ok(acceptedCanonicalIds.every(id => duplicates.includes(id)));
  assert.deepEqual(new Set(canonicalProposals.map(term => term.id)), new Set(acceptedCanonicalIds));
  const governed = canonicalGlossary(raw);
  assert.equal(new Set(governed.map(term => term.id)).size, governed.length);
  assert.equal(governed.find(term => term.id === 'stablecoin').review, 'accepted');
  assert.match(governed.find(term => term.id === 'triffin-dilemma').definition, /foreign official dollar claims held as reserves/);
  assert.match(governed.find(term => term.id === 'fiat-money').def, /^A state-issued currency/);
});

test('exact aliases expand without substring collisions; links preserve filters', () => {
  assert.deepEqual(searchPhrases('QE'), ['quantitative easing', 'qe']);
  assert.deepEqual(searchPhrases('UTXO'), ['unspent transaction output', 'utxo']);
  assert.deepEqual(searchPhrases('power'), ['power']);
  assert.ok(searchDocuments(manifest, blocks, 'UTXO').length > 0);
  assert.deepEqual(searchDocuments(manifest, blocks, 'zzzz-no-result', 'bitcoin'), []);
  const url = searchUrl('stablecoin', 'bitcoin');
  assert.deepEqual(searchState(url), { query: 'stablecoin', volume: 'bitcoin' });
});
