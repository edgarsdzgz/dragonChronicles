import { error } from '@sveltejs/kit';

// This page intentionally throws an error to test the error boundary
export function load() {
  // Throw a test error with a specific message and ID
  throw error(500, {
    message: 'This is a test error for the error boundary',
    id: 'test-error-boundary',
    details: {
      timestamp: new Date().toISOString(),
      purpose: 'Testing error boundary functionality',
      component: 'dev/boom test page'
    }
  });
}
