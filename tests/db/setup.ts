/**
 * Setup file for db tests
 *
 * Provides IndexedDB polyfill for Node.js testing environment
 */

import 'fake-indexeddb/auto';

// Auto import handles the polyfill automatically

// Mock CustomEvent for Node.js environment (required by Dexie)
if (typeof global.CustomEvent === 'undefined') {
  global.CustomEvent = class CustomEvent<T = any> extends Event {
    readonly detail: T;

    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail as T;
    }
  } as any;
}

// Mock Blob for Node.js environment
if (typeof global.Blob === 'undefined') {
  global.Blob = class Blob {
    private parts: any[];
    private options: any;

    constructor(parts: any[] = [], options: any = {}) {
      this.parts = parts;
      this.options = options;
    }

    async text(): Promise<string> {
      return this.parts
        .map((part) => (typeof part === 'string' ? part : JSON.stringify(part)))
        .join('');
    }

    get type(): string {
      return this.options.type || 'application/octet-stream';
    }
  } as any;
}

// Mock crypto for checksum generation
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    subtle: {
      digest: async (algorithm: string, data: Uint8Array): Promise<ArrayBuffer> => {
        // Simple hash implementation for testing
        const encoder = new TextEncoder();
        const str = new TextDecoder().decode(data);
        const hash = str.split('').reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
        return encoder.encode(hashStr).buffer;
      },
    },
  } as any;
}
