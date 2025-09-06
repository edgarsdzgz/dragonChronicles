import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.BASE_PATH || ''; // set to '/dragonChronicles' on GH Pages

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: 'index.html',
      precompress: false,
      strict: false,
    }),
    paths: { base },
    prerender: { entries: ['*'] },
    alias: { $lib: 'src/lib' },
    // Disable preloading to prevent body visibility issues in tests
    preload: {
      server: false,
      client: false,
    },
  },
};

export default config;
