import type { LayoutLoad } from './$types';
import { hudEnabled } from '$lib/stores/flags';

export const load: LayoutLoad = ({ url }) => {
  if (url.searchParams.get('hud') === '1') hudEnabled.set(true);
  return {};
};