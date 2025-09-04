import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const base = process.env.BASE_PATH || ''; // set to '/dragonChronicles' on GH Pages

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter({
      strict: false
    }),
    paths: { base },
    prerender: { entries: ['*'] },
    alias: { $lib: 'src/lib' },
  },
};

export default config;
