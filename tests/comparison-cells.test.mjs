import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexComparisonCells } from '../src/comparison-cells.js';

const records = JSON.parse(readFileSync(new URL('../public/content/comparison-cells.json', import.meta.url), 'utf8'));
const claims = Object.fromEntries(JSON.parse(readFileSync(new URL('../public/content/claims.json', import.meta.url), 'utf8')).map(row => [row.id, row]));
const sources = Object.fromEntries(JSON.parse(readFileSync(new URL('../public/content/sources.json', import.meta.url), 'utf8')).map(row => [row.id, row]));

test('comparison publishes five scoped, source-matched arrangement cases', () => {
  const indexed = indexComparisonCells(records, claims, sources);
  assert.deepEqual(Object.keys(indexed).sort(), [
    'bank-deposit:payment:household', 'fiat-backed-stablecoin:saving:household',
    'fiat-cash:payment:household', 'fiat-cash:payment:merchant',
    'self-custodied-btc:payment:household']);
  for (const cell of Object.values(indexed)) assert.ok(cell.uncertainty.length > 30);
  assert.match(indexed['fiat-cash:payment:merchant'].scope, /England or Wales/);
  assert.match(indexed['fiat-cash:payment:merchant'].uncertainty, /does not establish a particular shop/);
});

test('comparison rejects a citation outside its accepted claim', () => {
  const changed = structuredClone(records);
  changed[0].citations[0].locator = 'unreviewed settlement promise';
  assert.throws(() => indexComparisonCells(changed, claims, sources), /Unresolved comparison citation/);
  changed[0].citations[0].locator = records[0].citations[0].locator;
  changed[0].citations[0].href = 'javascript:alert(1)';
  assert.throws(() => indexComparisonCells(changed, claims, sources), /Unresolved comparison citation/);
});
