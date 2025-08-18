/**
 * @file TypeScript strict enforcement gate tests
 * 
 * Tests that TypeScript strict mode properly catches implicit any violations:
 * 
 * - PASS test: Verifies that well-typed code compiles cleanly under strict mode
 * - FAIL test: Verifies that implicit any code fails compilation with TS7006/TS7031
 * 
 * Assertions focus on exit codes and specific error codes only (not full message text)
 * to avoid brittle string matching while ensuring the strict gate functions correctly.
 */

import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscPath = require.resolve("typescript/bin/tsc");

/**
 * Helper function to run TypeScript compilation on a project
 * @param {string} projectPath - Path to tsconfig.json file
 * @returns {object} Spawn result with status, stdout, stderr
 */
const runTscProject = (projectPath) => {
  return spawnSync("node", [tscPath, "-p", projectPath], { encoding: "utf8" });
};

test("strict should PASS on good.ts", () => {
  const result = runTscProject("tests/ts-strict/tsconfig.strict.should-pass.json");
  assert.equal(result.status, 0, "expected pass config to compile cleanly");
});

test("strict should FAIL on bad-implicit-any.ts", () => {
  const result = runTscProject("tests/ts-strict/tsconfig.strict.should-fail.json");
  assert.notEqual(result.status, 0, "expected fail config to fail compilation");
  
  // Assert specific error codes (non-brittle) to ensure strict enforcement works
  const output = (result.stderr || result.stdout || "").toString();
  assert.ok(output.includes("TS7006") || output.includes("TS7031"), "expected implicit any error codes TS7006/TS7031");
});

await run();