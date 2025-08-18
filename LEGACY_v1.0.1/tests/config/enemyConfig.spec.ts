import { describe, it, expect, vi } from 'vitest';
import { loadEnemyConfig } from '$lib/config/enemyConfig';
import { get } from 'svelte/store';
import { enemyConfigLoaded } from '$lib/state/config';

describe('enemy-config loader', () => {
  it('loads and validates ok', async () => {
    const good = { spawning:{basicShooter:{meanIntervalSec:1.8,minDeltaSec:0.6,maxDeltaSec:3.5}},
      movement:{ownSpeedX_px_per_s:140,jitterPercent:0.05,reverseSpawnSpeedScale:0.9,reverseAdvanceScale_outOfRange:0.75,
      attackRangeFrac_ofCombatWidth:0.28,arrivalEpsilon_px:2},
      projectiles:{enemy:{speed_px_per_s:480,lifetimeSec:2.5,fireIntervalMinSec:0.85,fireIntervalMaxSec:1.35},player:{chainHitsMax:1}},
      caps:{enemies:48,projectiles:160,damageNumbers:120},
      scaling:{hpAcrossLandsMul:1.18,dmgAcrossLandsMul:1.12,withinLandEndRatio:0.85,withinLandStepMeters:5},
      bossLand10:{hpMultVsEndOfLand:2.8,dmgMultVsEndOfLand:2.0,burstShots:2,burstGapMs:150,fireIntervalMinSec:0.8,fireIntervalMaxSec:1.2}};
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => good }) as any;
    const cfg = await loadEnemyConfig();
    expect(cfg.movement.ownSpeedX_px_per_s).toBe(140);
    expect(get(enemyConfigLoaded)).toBe(true);
  });

  it('throws on invalid', async () => {
    const bad = { spawning: {} };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => bad }) as any;
    await expect(loadEnemyConfig()).rejects.toThrow();
  });
});