import { describe, it, expect } from 'vitest';
import { createPool } from '../../apps/web/src/lib/pool/pool';

describe('pool', () => {
  it('reuses instances', () => {
    let created = 0;
    const p = createPool(() => ({ id: ++created }), () => {}, 0); // start with empty pool
    const got = new Set<any>();
    
    // take 10, release 10, take 10 again
    const a = Array.from({ length: 10 }, () => p.acquire());
    a.forEach(o => got.add(o));
    a.forEach(o => p.release(o));

    const b = Array.from({ length: 10 }, () => p.acquire());
    b.forEach(o => got.add(o));

    // created should be low versus iterations; reuse high
    expect(created).toBeLessThanOrEqual(10); // not more than first burst
    expect(got.size).toBe(created);          // every created instance observed
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