import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFile } from 'node:child_process';
import { relative } from 'node:path';

function rebuildContentOnEdit() {
  return {
    name: 'rebuild-content-on-edit',
    configureServer(server) {
      let pending = false;
      server.watcher.on('change', changed => {
        const path = relative(server.config.root, changed).replaceAll('\\', '/');
        if (!/^public\/content\/(?:manifest\.json|observations\.json|(?:gold|after|bitcoin)\/[^/]+\.md)$/.test(path) || pending) return;
        pending = true;
        execFile(process.execPath, ['scripts/build-content.mjs'], { cwd: server.config.root }, error => {
          pending = false;
          if (error) server.config.logger.error(`Content index rebuild failed: ${error.message}`);
          else server.ws.send({ type: 'full-reload' });
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), rebuildContentOnEdit()],
  build: { outDir: 'dist', assetsDir: 'assets' },
});
