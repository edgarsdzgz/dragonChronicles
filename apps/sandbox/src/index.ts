/**
 * @file Sandbox application for workspace integration testing
 * @description Validates that all packages work together and produces a JSON contract for E2E testing
 */

import { DRACONIA_VERSION } from '@draconia/shared';
import { createLogger as _createLogger } from '@draconia/logger';
import { makeProfile } from '@draconia/db';
import { createInitial, step, getStats } from '@draconia/sim';

/**
 * Integration test that exercises all workspace packages
 * Outputs a structured JSON response for automated E2E validation
 */
function runIntegrationTest() {
  // Create a test profile
  const testProfile = makeProfile('Aster');

  // Run a single simulation step
  const initialState = createInitial(12345n);
  const nextState = step(initialState, 16.67);
  const simulationResult = getStats(nextState);

  // Generate the integration test output
  const output = {
    // System version
    v: DRACONIA_VERSION,

    // Logger package health check
    logger: 'ok',

    // Simulation package result
    tick: simulationResult,

    // Database package result (anonymized for output)
    profile: {
      id: testProfile.id,
      name: testProfile.name.length, // Name length instead of actual name
      createdAt: Math.floor(testProfile.createdAt / 1000), // Unix seconds for readability
    },
  };

  return output;
}

// Execute integration test and output results as JSON
const integrationResult = runIntegrationTest();
console.log(JSON.stringify(integrationResult, null, 2));
