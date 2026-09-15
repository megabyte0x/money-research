import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const rootPath = root.pathname;
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
  assert.match(chapter, /\[See the balance-sheet explainer\]\(\/mechanics\/\)/);
  assert.doesNotMatch(chapter, /\[See the balance-sheet explainer\]\(\/#\/mechanics\)/);
  assert.doesNotMatch(chapter, /new reserves sat in the banking system rather than circulating/);
});

test('prerendered chapter HTML links to /mechanics/ and has no hash-route hrefs', () => {
  const chapters = [
    'gold/08-why-the-dollar-replaced-gold/index.html',
    'gold/09-gold-today-what-still-holds-its-value/index.html',
    'after/07-financial-crisis-and-the-age-of-qe-2007-2019/index.html',
  ];
  for (const rel of chapters) {
    const html = readFileSync(join(rootPath, 'dist', rel), 'utf8');
    assert.match(html, /href="\/mechanics\/"/, rel);
    assert.doesNotMatch(html, /href="\/#\//, rel);
  }
});
