import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexSources } from '../src/sources.js';
import { createEvidenceIndex, indexClaims } from '../src/evidence.js';
import { indexObservations } from '../src/observations.js';

const sources = JSON.parse(readFileSync(new URL('../public/content/sources.json', import.meta.url)));
const claims = JSON.parse(readFileSync(new URL('../public/content/claims.json', import.meta.url)));
const observations = JSON.parse(readFileSync(new URL('../public/content/observations.json', import.meta.url)));

test('accepted observations resolve through stable source and claim locators', () => {
  assert.equal(indexObservations(observations).size, 10);
  const index = createEvidenceIndex(sources, claims, observations);
  assert.ok(Object.keys(index.sources).length >= 14);
  for (const id of ['E04', 'E10', 'E26-genius-enacted-scope', 'C09-monzo-fps-payment',
    'C09-btc-mainchain-payment', 'E29-russia-cpi-1992-dec-dec',
    'E31-proof-reserves-report-scope', 'E31-argentina-esf-2025-agreement-draw']) {
    assert.ok(index.claims[id], `${id}: accepted claim`);
    assert.ok(index.claims[id].supporting.length > 0, `${id}: exact supporting locator`);
  }
  assert.equal(index.sources['us-genius-public-law-119-27'].publisher, 'U.S. Government Publishing Office');
  assert.ok(index.claims['E26-genius-enacted-scope'].supporting.every(item => item.sourceId === 'us-genius-public-law-119-27'));
  assert.throws(() => createEvidenceIndex(sources, claims, [{ ...observations[0], sourceId: 'missing' }]), /Unresolved or inconsistent observation source/);
  assert.throws(() => createEvidenceIndex(sources, claims, [{ ...observations[0], claimId: 'missing' }]), /Unverified observation claim/);
});

test('calendar dates, IDs and accepted review state are validated', () => {
  assert.throws(() => indexSources([{ ...sources[0], publicationDate: '2026-02-30' }]), /Incomplete or duplicate source/);
  assert.throws(() => indexSources([...sources, sources[0]]), /duplicate source ID/);
  assert.doesNotThrow(() => indexSources([{ ...sources[0], publicationDate: null }]));
  assert.throws(() => indexObservations([{ ...observations[0], period: '2026-02-30' }]), /Incomplete or unverified observation/);
  assert.throws(() => indexClaims([...claims, claims[0]], indexSources(sources)), /duplicate claim ID/);
  assert.throws(() => indexClaims([{ ...claims[0], supporting: [{ sourceId: 'missing', locator: 'Table 1' }] }], indexSources(sources)), /Unresolved source locator/);
  assert.throws(() => indexClaims([{ ...claims[0], reviewState: 'accepted', reviewedBy: '' }], indexSources(sources)), /Unverified published claim/);
  assert.throws(() => createEvidenceIndex(sources, [{ ...claims[1], reviewState: 'review' }], [observations[0]]), /Unverified observation claim/);
});
