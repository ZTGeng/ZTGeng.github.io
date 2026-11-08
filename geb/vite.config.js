import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const source = new URL('./src/', import.meta.url);
const input = {
  geb: fileURLToPath(new URL('index.html', source)),
  '404': fileURLToPath(new URL('404.html', source)),
};
for (const chapter of readdirSync(new URL('chapters/', source), { withFileTypes: true })) {
  if (chapter.isDirectory()) {
    input[chapter.name] = fileURLToPath(new URL(`chapters/${chapter.name}/index.html`, source));
  }
}

// GitHub Pages serves the repository itself. publish-static.js copies only
// generated files back into /geb/, preserving the rest of this Jekyll site.
export default defineConfig({
  root: fileURLToPath(new URL('./src', import.meta.url)),
  base: '/geb/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets/app',
    // Three.js is already isolated in its own cached vendor chunk.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      input,
      output: {
        entryFileNames: 'assets/app/[name].js',
        chunkFileNames: 'assets/app/[name].js',
        assetFileNames: 'assets/app/[name][extname]',
        manualChunks: (id) => id.includes('node_modules/three/') ? 'three' : undefined,
      },
    },
  },
});
