import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { referenceSegments, shortTitle } from '../src/references.js';

const root = new URL('../', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'public/content/manifest.json'), 'utf8'));
const byVolumeNumber = new Map(manifest.map(record => [`${record.vol}/${record.num}`, record]));

test('chapter references render descriptive titles with stable destinations', () => {
  const segments = referenceSegments('See files 02, 04 and 05 for context.', 'after', byVolumeNumber);
  assert.equal(segments.filter(part => part.type === 'ref').length, 3);
  assert.equal(segments.map(part => part.text).join(''),
    `See “${shortTitle(byVolumeNumber.get('after/02'))}”, “${shortTitle(byVolumeNumber.get('after/04'))}” and “${shortTitle(byVolumeNumber.get('after/05'))}” for context.`);
  assert.deepEqual(segments.filter(part => part.type === 'ref').map(part => part.record.num), ['02', '04', '05']);
  assert.throws(() => referenceSegments('file 99', 'after', byVolumeNumber), /Unresolved file 99/);
});
