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
    rollupOptions: {
      // Ensure workspace deps are resolved, external deps are bundled
      external: (id) => {
        // Only externalize our workspace packages after they're resolved by aliases
        return false; // Bundle everything - let aliases handle workspace resolution
      },
    },
  },
  define: {
    // Ensure Workbox manifest is available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: [
      // Only alias workspace dependencies, leave other imports alone
      { find: '@draconia/logger', replacement: resolve(__dirname, '../../packages/logger/dist/index.js') },
      { find: '@draconia/db', replacement: resolve(__dirname, '../../packages/db/dist/index.js') },
    ],
  },
});
