import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173 },
  build: {
    target: 'es2021',
  },
  define: {
    // Ensure Workbox manifest is available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      // Ensure Vite can resolve workspace dependencies
      '@draconia/logger': resolve(__dirname, '../../packages/logger/dist/index.js'),
      '@draconia/db': resolve(__dirname, '../../packages/db/dist/index.js'),
    },
  },
  build: {
    target: 'es2021',
    rollupOptions: {
      external: [], // Ensure pixi.js and other deps are bundled, not externalized
    },
  },
});
