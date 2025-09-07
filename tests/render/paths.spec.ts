import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const required = [
  'apps/web/src/lib/pixi/app.ts',
  'apps/web/src/lib/pixi/dpr.ts',
  'apps/web/src/lib/pixi/hud.ts',
  'apps/web/src/lib/sim/background.ts',
  'apps/web/src/lib/pool/pool.ts',
  'apps/web/src/lib/pool/displayPool.ts',
  'apps/web/src/lib/flags/flags.ts',
  'apps/web/src/lib/flags/store.ts',
  'apps/web/src/lib/flags/query.ts',
  'apps/web/src/routes/+layout.svelte',
  'apps/web/src/routes/+layout.ts',
  'apps/web/src/routes/+page.svelte',
  'apps/web/src/routes/dev/pool/+page.svelte',
  'apps/web/svelte.config.js',
  'apps/web/vite.config.ts',
  'apps/web/src/app.html',
  'apps/web/src/app.d.ts',
  'apps/web/package.json',
];

describe('Required W2 file presence', () => {
  for (const rel of required) {
    it(`${rel} exists`, () => {
      const p = path.resolve(rel);
      const exists = fs.existsSync(p);
      expect(exists).toBe(true);
    });
  }
});

describe('Required test files presence', () => {
  const testFiles = [
    'tests/render/dpr.spec.ts',
    'tests/render/pool.spec.ts',
    'tests/render/ticker.spec.ts',
    'tests/render/background.spec.ts',
    'configs/vitest/vitest.config.ts',
  ];

  for (const rel of testFiles) {
    it(`${rel} exists`, () => {
      const p = path.resolve(rel);
      const exists = fs.existsSync(p);
      expect(exists).toBe(true);
    });
  }
});
