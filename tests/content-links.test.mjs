import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeContentHref, tokenizeInline } from '../src/md.js';

test('research Markdown links allow web and local routes without executable or protocol-relative URLs', () => {
  for (const href of ['https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm',
    'http://example.org/archive', '/gold/07-the-gold-standard-era-1717-1971/', '#/research']) {
    assert.equal(isSafeContentHref(href), true, href);
  }
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', '//example.org',
    'https://example.org\njavascript:alert(1)', 'https://', '/\\example.org']) {
    assert.equal(isSafeContentHref(href), false, href);
  }
});

test('source-page bare citations become safe links without swallowing punctuation', () => {
  const line = 'GPO — https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm . [More](https://example.org/more).';
  const sourceTokens = tokenizeInline(line, { linkifyUrls: true });
  assert.deepEqual(sourceTokens.filter(t => t.t === 'link').map(t => t.href), [
    'https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm',
    'https://example.org/more'
  ]);
  assert.ok(sourceTokens.some(t => t.t === 'text' && t.v.includes(' . ')));
  assert.deepEqual(tokenizeInline(line).filter(t => t.t === 'link').map(t => t.href), ['https://example.org/more']);
});
