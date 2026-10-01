import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoutePayload } from '../src/content-load.js';

test('timeline articles load after comparison has cached discovery data, then reuse cached blocks', async t => {
  const requests = [];
  const blocks = [{ type: 'table', rows: [['1971', 'Gold window closes']] }];
  t.mock.method(globalThis, 'fetch', async path => {
    requests.push(path);
    return { ok: true, json: async () => path.endsWith('discovery.json') ? { observations: {} } : { blocks } };
  });
  const state = {
    manifest: [{ id: 'gold-10', vol: 'gold', slug: '10-master-timeline' }],
    blocks: {},
  };
  Object.assign(state, await loadRoutePayload({ view: 'compare' }, state));
  Object.assign(state, await loadRoutePayload({ view: 'timeline' }, state));
  assert.deepEqual(state.blocks['10-master-timeline@gold'], blocks);
  assert.deepEqual(requests, ['/content/discovery.json', '/content/articles/gold-10.json']);
  await loadRoutePayload({ view: 'timeline' }, state);
  assert.equal(requests.length, 2);
});
