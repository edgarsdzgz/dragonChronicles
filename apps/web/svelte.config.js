import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.BASE_PATH || ''; // set to '/dragonChronicles' on GH Pages

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      strict: false,
    }),
    paths: { base },
    prerender: { entries: ['*'] },
    alias: { $lib: 'src/lib' },
  },
};

export default config;
