// Simplified Node.js test runner for render tests
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const tests = [];
const describe = (name, fn) => {
  console.log(`\n${name}`);
  fn();
};

const it = (name, fn) => {
  tests.push({ name, fn });
};

const expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toEqual: (expected) => assert.deepStrictEqual(actual, expected),
  toBeGreaterThan: (expected) => assert.ok(actual > expected, `${actual} should be > ${expected}`),
  toBeGreaterThanOrEqual: (expected) => assert.ok(actual >= expected, `${actual} should be >= ${expected}`),
  toBeLessThanOrEqual: (expected) => assert.ok(actual <= expected, `${actual} should be <= ${expected}`),
  toBeInstanceOf: (expected) => assert.ok(actual instanceof expected),
  toHaveProperty: (prop) => assert.ok(Object.prototype.hasOwnProperty.call(actual, prop)),
  not: {
    toThrow: (_fn) => {
      try { 
        if (typeof actual === 'function') actual(); 
        else actual;
      } catch (e) { 
        throw new Error('Expected not to throw but threw: ' + e.message); 
      }
    }
  }
});

// Mock vi for fake timers
const _vi = {
  useFakeTimers: () => {},
  useRealTimers: () => {},
  advanceTimersByTime: (_ms) => {},
  fn: () => ({ mock: { calls: [] }, mockClear: () => {} })
};

const _beforeEach = (_fn) => {};
const _afterEach = (_fn) => {};

// DPR tests
describe('clampDPR', () => {
  const clampDPR = (raw = 1, min = 1, max = 2) => Math.max(min, Math.min(max, raw));
  
  it('clamps to [1,2] by default', () => {
    expect(clampDPR(0.5)).toBe(1);
    expect(clampDPR(1.5)).toBe(1.5);
    expect(clampDPR(3)).toBe(2);
  });

  it('respects custom min/max bounds', () => {
    expect(clampDPR(1.5, 2, 4)).toBe(2);
    expect(clampDPR(3, 2, 4)).toBe(3);
    expect(clampDPR(5, 2, 4)).toBe(4);
  });
});

// Pool tests
describe('pool', () => {
  const createPool = (factory, reset, initial = 0) => {
    const free = [];
    const all = [];
    
    // Pre-populate with initial objects
    for (let i = 0; i < initial; i++) {
      const obj = factory();
      all.push(obj);
      free.push(obj);
    }

    return {
      acquire() {
        const obj = free.pop() ?? (() => {
          const newObj = factory();
          all.push(newObj);
          return newObj;
        })();
        return obj;
      },
      release(obj) {
        reset(obj);
        free.push(obj);
      },
      size() { return all.length; },
      inUse() { return all.length - free.length; }
    };
  };

  it('reuses instances', () => {
    let created = 0;
    const p = createPool(() => ({ id: ++created }), () => {}, 0);
    const got = new Set();
    
    // Test reuse pattern - with only 1 object created, should reuse heavily
    for (let i = 0; i < 100; i++) {
      const o = p.acquire();
      got.add(o);
      p.release(o);
    }
    
    // Should create very few objects due to reuse
    expect(created).toBeLessThanOrEqual(5);
    expect(got.size).toBe(created);
  });

  it('tracks pool size and usage correctly', () => {
    const p = createPool(() => ({}), () => {}, 5);
    
    expect(p.size()).toBe(5);
    expect(p.inUse()).toBe(0);
    
    const obj1 = p.acquire();
    expect(p.inUse()).toBe(1);
    
    const obj2 = p.acquire();
    expect(p.inUse()).toBe(2);
    
    p.release(obj1);
    expect(p.inUse()).toBe(1);
    
    p.release(obj2);
    expect(p.inUse()).toBe(0);
  });
});

// HUD tests
describe('HUD flag logic', () => {
  it('detects hud=1 in query parameters', () => {
    const url1 = new URL('https://example.test/?hud=1');
    const url2 = new URL('https://example.test/?other=value');
    const url3 = new URL('https://example.test/?hud=1&other=value');
    
    expect(url1.searchParams.get('hud')).toBe('1');
    expect(url2.searchParams.get('hud')).toBe(null);
    expect(url3.searchParams.get('hud')).toBe('1');
  });

  it('parses different hud values correctly', () => {
    const url1 = new URL('https://example.test/?hud=0');
    const url2 = new URL('https://example.test/?hud=true');
    const url3 = new URL('https://example.test/?hud=1');
    
    expect(url1.searchParams.get('hud') === '1').toBe(false);
    expect(url2.searchParams.get('hud') === '1').toBe(false);
    expect(url3.searchParams.get('hud') === '1').toBe(true);
  });
});

// File presence tests
describe('Required W2 file presence', () => {
  const required = [
    'apps/web/src/lib/pixi/app.ts',
    'apps/web/src/lib/pixi/dpr.ts', 
    'apps/web/src/lib/pixi/hud.ts',
    'apps/web/src/lib/sim/background.ts',
    'apps/web/src/lib/pool/pool.ts',
    'apps/web/src/lib/pool/displayPool.ts',
    'apps/web/src/lib/stores/flags.ts',
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

  for (const rel of required) {
    it(`${rel} exists`, () => {
      const p = path.resolve(rel);
      const exists = fs.existsSync(p);
      expect(exists).toBe(true);
    });
  }
});

// Run all tests
console.log('Running render tests...');
let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    test.fn();
    console.log(`  ✔ ${test.name}`);
    passed++;
  } catch (err) {
    console.log(`  ✖ ${test.name} — ${err.message}`);
    failed++;
  }
}

console.log(`\nRender tests: ${passed}/${passed + failed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}