import { defineConfig } from 'cf/config';

export default defineConfig({
  accountId: '1378ab230486e0367cbcb49a0f4cec1d',
  worker: {
    name: 'goldtozcash',
    compatibilityDate: '2026-10-19',
    domains: ['goldtozcash.com'],
    workersDev: false,
    assets: {
      htmlHandling: 'force-trailing-slash',
      notFoundHandling: '404-page',
    },
  },
});
