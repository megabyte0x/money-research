import test from 'node:test';
import assert from 'node:assert/strict';
import { indexArticleMetadata } from '../src/article-metadata.js';

const manifest = [
  { id: 'gold-01', vol: 'gold', slug: '01-the-metal-itself' },
  { id: 'gold-02', vol: 'gold', slug: '02-before-money' },
  { id: 'gold-10', vol: 'gold', slug: '10-master-timeline' }
];
const blocks = { '02-before-money@gold': [{ type: 'h2', id: 'ornament-and-status' }] };
const approved = {
  id: 'gold-01', status: 'approved',
  summary: { question: 'What made gold usable?', answer: 'Its properties made it workable.',
    takeaways: ['Gold can be worked.', 'Money also needs acceptance.', 'A coin also needs rules.'],
    evidenceAndUncertainty: 'Material properties support the bounded answer; examples do not establish universal acceptance.' },
  nextSteps: [{ kind: 'Continue', targetArticleId: 'gold-02', targetSectionId: 'ornament-and-status', reason: 'See an early non-money role.' }]
};

test('approved chapter summaries and curated section links resolve exactly', () => {
  const index = indexArticleMetadata([approved], manifest, blocks);
  assert.equal(index['gold-01'].nextSteps[0].targetSectionId, 'ornament-and-status');
  assert.equal(index['gold-01'].summary.takeaways.length, 3);
});

test('reader metadata rejects unknown sections and reference-file summaries', () => {
  assert.throws(() => indexArticleMetadata([{ ...approved, nextSteps: [{ ...approved.nextSteps[0], targetSectionId: 'irrelevant' }] }], manifest, blocks), /Missing next-step section/);
  assert.throws(() => indexArticleMetadata([{ ...approved, id: 'gold-10' }], manifest, blocks), /Reference article/);
});
