import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

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
      output: {
        entryFileNames: 'assets/app/geb.js',
        chunkFileNames: 'assets/app/[name].js',
        assetFileNames: 'assets/app/[name][extname]',
        manualChunks: (id) => id.includes('node_modules/three/') ? 'three' : undefined,
      },
    },
  },
});
