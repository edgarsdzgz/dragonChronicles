import { describe, it, expect, vi } from 'vitest';
import { loadEnemyConfig } from '$lib/config/loadEnemyConfig';
import { enemyConfigLoaded } from '$lib/state/config';
import { get } from 'svelte/store';

describe('enemy-config loader', () => {
  it('sets flag true on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ foo: 'bar' }) }) as any;
    const cfg = await loadEnemyConfig();
    expect(get(enemyConfigLoaded)).toBe(true);
    expect(cfg.foo).toBe('bar');
  });

  it('sets flag false on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    await expect(loadEnemyConfig()).rejects.toThrow();
    expect(get(enemyConfigLoaded)).toBe(false);
  });
});