export interface Pool<T> {
  acquire(): T;
  release(_obj: T): void;
  size(): number;
  inUse(): number;
}

export function createPool<T>(
  factory: () => T,
  reset: (_t: T) => void = () => {},
  initial = 0,
): Pool<T> {
  const free: T[] = [];
  let created = 0;

  // Pre-populate with initial objects
  for (let i = 0; i < initial; i++) {
    const obj = factory();
    created++;
    free.push(obj);
  }

  return {
    acquire() {
      const obj = free.pop();
      if (obj) {
        return obj;
      }
      // Create new object when free list is empty
      created++;
      return factory();
    },
    release(obj) {
      reset(obj);
      free.push(obj);
    },
    size() {
      return created;
    },
    inUse() {
      return created - free.length;
    },
  };
}

// Alternative class-based implementation for better performance
export class PoolImpl<T> {
  private free: T[] = [];
  private created = 0;

  constructor(
    private _create: () => T,
    private _reset: (_t: T) => void = () => {},
    private _max = Infinity,
  ) {}

  get(): T {
    const obj = this.free.pop() ?? (this.created++, this._create());
    return obj;
  }

  release(obj: T) {
    this._reset(obj);
    if (this.free.length < this._max) this.free.push(obj);
  }

  stats() {
    return { created: this.created, free: this.free.length };
  }
}
