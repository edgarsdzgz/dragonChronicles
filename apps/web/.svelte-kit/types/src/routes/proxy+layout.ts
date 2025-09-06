// @ts-nocheck
import type { LayoutLoad } from './$types';
import { appFlags } from '$lib/flags/store';
import { createFlags } from '$lib/flags/flags';

export const load = ({ url }: Parameters<LayoutLoad>[0]) => {
  // Initialize flags from environment, query string, and defaults
  const flags = createFlags(url);
  appFlags.set(flags);

  return {};
};
