import type { LayoutLoad } from './$types';
import { appFlags } from '$lib/flags/store';
import { createFlags } from '$lib/flags/flags';

export const load: LayoutLoad = ({ url }) => {
  // Initialize flags from environment, query string, and defaults
  const flags = createFlags(url);
  appFlags.set(flags);
  
  return {};
};
