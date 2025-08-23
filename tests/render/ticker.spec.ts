import { describe, it, expect } from 'vitest';

// Policy now: rendering pauses when hidden; background sim continues.
function policy(hidden: boolean) {
  return hidden ? { render: 'stop', sim: 'continue' } : { render: 'start', sim: 'ui-thread' };
}

describe('visibility policy', () => {
  it('stops rendering when hidden and continues sim', () => {
    expect(policy(true)).toEqual({ render: 'stop', sim: 'continue' });
  });

  it('starts rendering when visible', () => {
    expect(policy(false)).toEqual({ render: 'start', sim: 'ui-thread' });
  });
});