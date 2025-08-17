import { z } from 'zod';
import { setEnemyConfigLoaded } from '$lib/state/config';

const Shooter = z.object({
  meanIntervalSec: z.number().positive(),
  minDeltaSec:     z.number().nonnegative(),
  maxDeltaSec:     z.number().positive()
}).refine(s => s.maxDeltaSec >= s.minDeltaSec);

export const EnemyCfgSchema = z.object({
  spawning: z.object({ basicShooter: Shooter }),
  movement: z.object({
    ownSpeedX_px_per_s: z.number().positive(),
    jitterPercent: z.number().min(0).max(0.5),
    reverseSpawnSpeedScale: z.number().min(0).max(2),
    reverseAdvanceScale_outOfRange: z.number().min(0).max(2),
    attackRangeFrac_ofCombatWidth: z.number().min(0.1).max(0.9),
    arrivalEpsilon_px: z.number().min(0.5).max(10)
  }),
  projectiles: z.object({
    enemy: z.object({
      speed_px_per_s: z.number().positive(),
      lifetimeSec: z.number().positive(),
      fireIntervalMinSec: z.number().positive(),
      fireIntervalMaxSec: z.number().positive()
    }).refine(p => p.fireIntervalMaxSec >= p.fireIntervalMinSec),
    player: z.object({ chainHitsMax: z.number().int().min(0).max(8) })
  }),
  caps: z.object({
    enemies: z.number().int().min(1).max(512),
    projectiles: z.number().int().min(1).max(2048),
    damageNumbers: z.number().int().min(1).max(2048)
  }),
  scaling: z.object({
    hpAcrossLandsMul: z.number().min(1.01).max(3),
    dmgAcrossLandsMul: z.number().min(1.01).max(3),
    withinLandEndRatio: z.number().min(0.3).max(0.99),
    withinLandStepMeters: z.number().int().min(1).max(50),
    baseHP_atLand1_formula: z.string().optional(),
    baseDmg_atLand1_formula: z.string().optional()
  }),
  bossLand10: z.object({
    hpMultVsEndOfLand: z.number().min(1).max(10),
    dmgMultVsEndOfLand: z.number().min(1).max(10),
    burstShots: z.number().int().min(1).max(5),
    burstGapMs: z.number().int().min(50).max(1000),
    fireIntervalMinSec: z.number().positive(),
    fireIntervalMaxSec: z.number().positive()
  }),
  ui: z.object({
    enemyHpBar: z.object({
      visibleOnlyWhenDamaged: z.boolean(),
      color: z.string(),
      thicknessPx: z.number().positive(),
      widthPctOfEnemy: z.number().min(10).max(200),
      hideDelayAtFullSec: z.number().nonnegative()
    }),
    damageNumbers: z.object({
      popScale: z.number().positive(),
      floatUpPx: z.number(),
      fadeDurationSec: z.number().positive(),
      offsetJitterX: z.number().nonnegative(),
      offsetJitterY: z.number().nonnegative(),
      playerHitColor: z.string(),
      enemyHitColor: z.string(),
      maxDotHz: z.number().positive()
    })
  }).optional()
});

export type EnemyCfg = z.infer<typeof EnemyCfgSchema>;

export async function loadEnemyConfig(): Promise<EnemyCfg> {
  const res = await fetch('/enemy-config.json');
  if (!res.ok) {
    setEnemyConfigLoaded(false);
    throw new Error('enemy-config.json not found');
  }
  const json = await res.json();
  const parse = EnemyCfgSchema.safeParse(json);
  if (!parse.success) {
    setEnemyConfigLoaded(false);
    console.error('Enemy config invalid:', parse.error);
    throw new Error('enemy-config.json invalid');
  }
  setEnemyConfigLoaded(true);
  return parse.data;
}