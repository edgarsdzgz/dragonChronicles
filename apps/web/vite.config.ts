import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173 },
  build: {
    target: 'es2021',
  },
  resolve: {
    // Required for PNPM workspace structure
    preserveSymlinks: true,
  },
  optimizeDeps: {
    // Help Vite handle PNPM workspace dependencies
    include: ['pixi.js'],
  },
  ssr: {
    // Prevent pixi.js from being externalized during SSR build
    noExternal: ['pixi.js'],
  },
  define: {
    // Ensure Workbox manifest is available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
