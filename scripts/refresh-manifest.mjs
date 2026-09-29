import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseMd } from '../src/md.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const path = join(root, 'public/content/manifest.json');
const manifest = JSON.parse(readFileSync(path, 'utf8'));
const changed = [];
for (const record of manifest) {
  const content = readFileSync(join(root, 'public', record.path), 'utf8');
  const words = content.trim().split(/\s+/).length;
  const h2 = parseMd(content).filter(block => block.type === 'h2').map(block => block.text);
  // Dates come from full git history; Vercel's shallow clone can't compute them at build time.
  const dates = execFileSync('git', ['log', '--follow', '--format=%cs', '--', join('public', record.path)], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  if (dates.length) { record.published = dates.at(-1); record.modified = dates[0]; }
  if (record.words !== words || JSON.stringify(record.h2) !== JSON.stringify(h2)) {
    changed.push({ id: record.id, oldWords: record.words, words,
      headingChanged: JSON.stringify(record.h2) !== JSON.stringify(h2) });
    record.words = words;
    record.h2 = h2;
  }
}
if (process.argv.includes('--write')) {
  writeFileSync(path, JSON.stringify(manifest, null, 1) + '\n');
}
console.log(JSON.stringify({ changed, written: process.argv.includes('--write') }, null, 2));
