// Test setup for Dragonforge Chronicles
import { beforeAll } from 'vitest';

// Mock browser APIs that might not be available in test environment
beforeAll(() => {
  // Mock localStorage if needed
  if (!global.localStorage) {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    };
  }

  // Mock performance.now for consistent timing in tests
  global.performance = global.performance || {
    now: () => Date.now()
  };

  // Suppress console logs in tests (unless debugging)
  if (!process.env.DEBUG) {
    global.console = {
      ...global.console,
      log: () => {},
      debug: () => {},
      info: () => {}
    };
  }
});