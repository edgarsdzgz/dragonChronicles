import { describe, it, expect } from 'vitest';
import { createPool } from '../../apps/web/src/lib/pool/pool';

describe('pool', () => {
  it('reuses instances', () => {
    let created = 0;
    const p = createPool(() => ({ id: ++created }), () => {}, 10);
    const got = new Set<any>();
    
    for (let i = 0; i < 1000; i++) {
      const o = p.acquire();
      got.add(o);
      p.release(o);
    }
    
    // created should be low versus iterations; reuse high
    expect(created).toBeLessThanOrEqual(50);
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