import adapter from '@sveltejs/adapter-static';

const base = process.env.BASE_PATH || ''; // set to '/dragonChronicles' on GH Pages

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    paths: { base },
    prerender: { entries: ['*'] },
    alias: { $lib: 'src/lib' }
  }
};

export default config;