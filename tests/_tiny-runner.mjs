/**
 * @file Minimal test runner for Phase 0 validation
 * @description Provides structured test execution with proper exit codes for CI/CD integration
 * 
 * This is a lightweight alternative to Jest/Vitest for early phase validation.
 * Will be replaced with proper testing frameworks in later phases.
 */

/**
 * Test case registry - holds all registered test functions
 * @type {Array<{name: string, fn: () => Promise<void> | void}>}
 */
const testCases = [];

/**
 * Registers a test case for execution
 * @param {string} name - Descriptive test name
 * @param {() => Promise<void> | void} testFn - Test function (sync or async)
 * 
 * @example
 * test("should add numbers correctly", () => {
 *   assert.equal(1 + 1, 2);
 * });
 */
export const test = (name, testFn) => {
  testCases.push({ name, fn: testFn });
};

/**
 * Executes all registered test cases and reports results
 * Provides proper exit codes for CI/CD integration:
 * - Exit 0: All tests passed
 * - Exit 1: One or more tests failed
 * 
 * @returns {Promise<never>} Always exits the process
 */
export const run = async () => {
  let passCount = 0;
  let failCount = 0;
  const failures = [];

  // Execute each test case
  for (const testCase of testCases) {
    try {
      await testCase.fn();
      passCount++;
    } catch (error) {
      failCount++;
      failures.push({
        name: testCase.name,
        error
      });
    }
  }

  // Report results and exit with appropriate code
  if (failCount === 0) {
    console.log(`ok - ${passCount} passed`);
    process.exit(0);
  } else {
    console.error(`FAIL - ${failCount} failed, ${passCount} passed`);
    
    // Report failure details
    for (const failure of failures) {
      const errorMessage = failure.error?.message || String(failure.error);
      console.error(`  ✖ ${failure.name}: ${errorMessage}`);
    }
    
    process.exit(1);
  }
};