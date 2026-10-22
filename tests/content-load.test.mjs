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

test('reader routes retain glossary definitions and summaries across cached navigation', async t => {
  const reader = {
    glossary: [{ id: 'fiat-money', term: 'Fiat money', def: 'A state-issued currency.' }],
    articleMetadata: { 'gold-01': { summary: { answer: 'Gold is chemically unusual.' } } },
  };
  const article = [{ type: 'p', text: 'Gold is chemically unusual.' }];
  const existing = [{ type: 'p', text: 'An already loaded chapter.' }];
  const fetch = t.mock.method(globalThis, 'fetch', async path => {
    if (path.endsWith('reader.json')) return { ok: true, json: async () => reader };
    assert.equal(path, '/content/articles/gold-01.json');
    return { ok: true, json: async () => ({ blocks: article }) };
  });
  const state = {
    manifest: [{ id: 'gold-01', vol: 'gold', slug: '01-the-metal-itself' }],
    blocks: { 'existing@gold': existing },
  };
  assert.deepEqual(await loadRoutePayload({ view: 'home' }, state), {});
  Object.assign(state, await loadRoutePayload({ view: 'article', vol: 'gold', slug: '01-the-metal-itself' }, state));
  assert.deepEqual(state.glossary, reader.glossary);
  assert.deepEqual(state.articleMetadata, reader.articleMetadata);
  assert.deepEqual(state.blocks, { 'existing@gold': existing, '01-the-metal-itself@gold': article });
  for (const view of ['glossary', 'takeaways', 'sources']) {
    const payload = await loadRoutePayload({ view }, { manifest: [] });
    assert.deepEqual(payload.glossary, reader.glossary, `${view}: missing glossary definitions`);
    assert.deepEqual(payload.articleMetadata, reader.articleMetadata, `${view}: missing summaries`);
  }
  fetch.mock.mockImplementation(() => { throw new Error('Cached route must not fetch again'); });
  for (const view of ['article', 'glossary', 'takeaways', 'sources']) {
    assert.deepEqual(await loadRoutePayload({ view, vol: 'gold', slug: '01-the-metal-itself' }, state), {});
  }
});
