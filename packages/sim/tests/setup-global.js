/**
 * Global test setup - runs for ALL tests
 * Provides IndexedDB polyfill and common mocks
 */
// Only apply polyfills in Node.js environment
if (typeof window === 'undefined') {
    // Import polyfill
    import('fake-indexeddb/auto');
    // Apply common mocks
    if (typeof global.CustomEvent === 'undefined') {
        global.CustomEvent = class CustomEvent extends Event {
            detail;
            constructor(type, eventInitDict) {
                super(type, eventInitDict);
                this.detail = eventInitDict?.detail;
            }
        };
    }
    // Mock Blob if needed
    if (typeof global.Blob === 'undefined') {
        global.Blob = class Blob {
            parts;
            options;
            constructor(parts = [], options = {}) {
                this.parts = parts;
                this.options = options;
            }
            async text() {
                return this.parts
                    .map((part) => (typeof part === 'string' ? part : JSON.stringify(part)))
                    .join('');
            }
            get type() {
                return this.options.type || 'application/octet-stream';
            }
        };
    }
    // Mock crypto for checksum generation
    if (typeof global.crypto === 'undefined') {
        global.crypto = {
            subtle: {
                digest: async (algorithm, data) => {
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
        };
    }
}
export {};
