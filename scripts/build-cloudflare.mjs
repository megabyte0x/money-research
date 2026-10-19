import { fileURLToPath } from 'node:url';
import {
  cleanBuildOutputDir, readBuildOutput, writeAssets, writeRootConfig, writeWorkerConfig,
} from '@cloudflare/build-output-utils';
import config from '../cloudflare.config.ts';

// Package the existing build only after prerender has written every chapter.
// cf build's Vite auto-detection would skip our content and prerender scripts.
const root = fileURLToPath(new URL('../', import.meta.url));
await cleanBuildOutputDir(root);
await writeRootConfig(root, { accountId: config.accountId }, { isPreview: false });
await writeWorkerConfig({ root, config: config.worker });
await writeAssets({ root, sourceDirectory: fileURLToPath(new URL('../dist', import.meta.url)) });
await readBuildOutput(root);
console.log('Cloudflare assets-only build validated.');
