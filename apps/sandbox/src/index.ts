/**
 * @file Sandbox application for workspace integration testing
 * @description Validates that all packages work together and produces a JSON contract for E2E testing
 */

import { DRACONIA_VERSION } from "@draconia/shared";
import { helloLog } from "@draconia/logger";
import { makeProfile } from "@draconia/db";
import { simulateTick } from "@draconia/sim";

/**
 * Integration test that exercises all workspace packages
 * Outputs a structured JSON response for automated E2E validation
 */
function runIntegrationTest() {
  // Create a test profile
  const testProfile = makeProfile("Aster");
  
  // Run a single simulation tick
  const simulationResult = simulateTick(0);
  
  // Generate the integration test output
  const output = {
    // System version
    v: DRACONIA_VERSION,
    
    // Logger package health check
    hello: helloLog(),
    
    // Simulation package result
    tick: simulationResult,
    
    // Database package result (anonymized for output)
    profile: {
      id: testProfile.id,
      name: testProfile.name.length,  // Name length instead of actual name
      createdAt: Math.floor(testProfile.createdAt / 1000)  // Unix seconds for readability
    }
  };
  
  return output;
}

// Execute integration test and output results as JSON
const integrationResult = runIntegrationTest();
console.log(JSON.stringify(integrationResult, null, 2));