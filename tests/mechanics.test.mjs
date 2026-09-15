import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const page = readFileSync(new URL('src/MoneyMechanics.jsx', root), 'utf8');
const app = readFileSync(new URL('src/App.jsx', root), 'utf8');

test('four money-mechanics transactions are reachable and sourced', () => {
  assert.match(app, /isMechanics && <MoneyMechanics/);
  for (const id of ['loan', 'payment', 'bond', 'qe']) {
    assert.ok(page.includes(`id="mechanics-${id}"`), id);
    assert.ok(page.includes(`href="/mechanics/#mechanics-${id}"`), id);
  }
  for (const host of ['bankofengland.co.uk', 'dmo.gov.uk']) assert.ok(page.includes(host), host);
  assert.equal((page.match(/<Changes caption=/g) || []).length, 4);
});

test('corrected QE chapter distinguishes asset purchases from loans and borrowing', () => {
  const chapter = readFileSync(new URL('public/content/after/07-financial-crisis-and-the-age-of-qe-2007-2019.md', root), 'utf8');
  assert.match(chapter, /not the same transaction as a government issuing new debt or a bank making a customer loan/);
  assert.match(chapter, /reserves.*deposit/);
  assert.match(chapter, /\[See the balance-sheet explainer\]\(\/#\/mechanics\)/);
  assert.doesNotMatch(chapter, /new reserves sat in the banking system rather than circulating/);
});
