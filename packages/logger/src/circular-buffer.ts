/**
 * Efficient circular buffer implementation for high-performance logging
 *
 * Replaces linear array with O(1) push/shift operations
 * Eliminates memory fragmentation and improves performance under high load
 */

export class CircularBuffer<T> {
  private buffer: T[] = [];
  private head = 0;
  private tail = 0;
  private size = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add item to buffer, evicting oldest if at capacity
   * O(1) operation
   */
  push(item: T): void {
    if (this.size === this.capacity) {
      // Buffer is full, evict oldest item
      this.buffer[this.head] = item;
      this.head = (this.head + 1) % this.capacity;
      this.tail = (this.tail + 1) % this.capacity;
      // Size remains the same
    } else {
      // Buffer has space, add item
      this.buffer[this.tail] = item;
      this.tail = (this.tail + 1) % this.capacity;
      this.size++;
    }
  }

  /**
   * Remove and return oldest item
   * O(1) operation
   */
  shift(): T | undefined {
    if (this.size === 0) return undefined;

    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }

  /**
   * Get current number of items
   */
  get length(): number {
    return this.size;
  }

  /**
   * Check if buffer is empty
   */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Check if buffer is full
   */
  get isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Get all items as array (for export)
   * O(n) operation, use sparingly
   */
  toArray(): T[] {
    if (this.size === 0) return [];

    const result: T[] = [];
    let current = this.head;

    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== undefined) {
        result.push(item);
      }
      current = (current + 1) % this.capacity;
    }

    return result;
  }

  /**
   * Clear all items
   * O(1) operation
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * Get items up to a specific limit
   * Useful for partial exports
   */
  toArrayLimited(limit: number): T[] {
    if (this.size === 0 || limit <= 0) return [];

    const result: T[] = [];
    let current = this.head;
    const count = Math.min(limit, this.size);

    for (let i = 0; i < count; i++) {
      const item = this.buffer[current];
      if (item !== undefined) {
        result.push(item);
      }
      current = (current + 1) % this.capacity;
    }

    return result;
  }

  /**
   * Iterate over items without removing them
   */
  forEach(callback: (_item: T, _index: number) => void): void {
    if (this.size === 0) return;

    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== undefined) {
        callback(item, i);
      }
      current = (current + 1) % this.capacity;
    }
  }

  /**
   * Map items to new array without removing them
   */
  map<U>(callback: (_item: T, _index: number) => U): U[] {
    if (this.size === 0) return [];

    const result: U[] = [];
    let current = this.head;

    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== undefined) {
        result.push(callback(item, i));
      }
      current = (current + 1) % this.capacity;
    }

    return result;
  }
}
