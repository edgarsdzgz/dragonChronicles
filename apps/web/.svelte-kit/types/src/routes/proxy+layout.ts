// @ts-nocheck
import type { LayoutLoad } from './$types';
import { hudEnabled } from '$lib/stores/flags';

export const load = ({ url }: Parameters<LayoutLoad>[0]) => {
  if (url.searchParams.get('hud') === '1') hudEnabled.set(true);
  return {};
};