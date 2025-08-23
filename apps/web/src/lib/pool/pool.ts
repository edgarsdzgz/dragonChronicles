export interface Pool<T> {
  acquire(): T;
  release(obj: T): void;
  size(): number;
  inUse(): number;
}

export function createPool<T>(factory: () => T, reset: (t: T) => void, initial = 0): Pool<T> {
  const free: T[] = [];
  const all: T[] = [];
  
  // Pre-populate with initial objects
  for (let i = 0; i < initial; i++) {
    const obj = factory();
    all.push(obj);
    free.push(obj);
  }

  return {
    acquire() {
      const obj = free.pop() ?? factory();
      if (!all.includes(obj)) all.push(obj);
      return obj;
    },
    release(obj) {
      reset(obj);
      free.push(obj);
    },
    size() { 
      return all.length; 
    },
    inUse() { 
      return all.length - free.length; 
    }
  };
}