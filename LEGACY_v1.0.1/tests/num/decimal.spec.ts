import { describe, it, expect } from 'vitest';
import { Decimal } from '$lib/num/decimal';

describe('Decimal (ESM)', () => {
  it('constructs large values', () => {
    const d = new Decimal('1e100');
    expect(d.toString()).toMatch(/^1e\+?100$/);
  });
});