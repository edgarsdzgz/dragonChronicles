import { describe, it, expect } from 'vitest';
import { Decimal } from '$lib/num/decimal';

describe('Decimal sanity', () => {
  it('creates a big number without error', () => {
    const d = new Decimal('1e100');
    expect(d.toString()).toMatch(/^1e\+?100$/);
  });
});

import { bootFlags } from '$lib/state/boot';
import { get } from 'svelte/store';

describe('Boot flags default', () => {
  it('start false before diagnostics', () => {
    const f = get(bootFlags);
    expect(f.decOK).toBe(false);
    expect(f.rendererSubscribed).toBe(false);
    expect(f.workerActive).toBe(false);
  });
});