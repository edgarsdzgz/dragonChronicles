// tests/run-all.mjs
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  // Always surface child output so test results are visible
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(" ")}`);
    process.exit(r.status ?? 1);
  }
  return r;
};

// Explicit per-package tsconfig paths (order matters for deps → consumers)
const projects = [
  "packages/shared/tsconfig.json",
  "packages/logger/tsconfig.json",
  "packages/db/tsconfig.json",
  "packages/sim/tsconfig.json",
  "apps/sandbox/tsconfig.json",
].filter(existsSync);

if (process.env.VERBOSE) console.log("Building TypeScript projects.");
// Use direct TypeScript path to avoid pnpm exec issues on Windows
const tscPath = "node_modules/.pnpm/typescript@5.9.2/node_modules/typescript/lib/tsc.js";

if (projects.length === 0) {
  // Fallback: root build if no per-package tsconfigs were found
  run("node", [tscPath, "-b", "--pretty", "false", "--verbose"]);
} else {
  // One multi-project build (tsc -b resolves proper order)
  run("node", [tscPath, "-b", "--pretty", "false", "--verbose", ...projects]);
}

if (process.env.VERBOSE) console.log("Verifying build artifacts...");
const expectedArtifacts = [
  "packages/shared/dist/index.js",
  "packages/logger/dist/index.js", 
  "packages/db/dist/index.js",
  "packages/sim/dist/index.js",
  "apps/sandbox/dist/index.js"
];

for (const artifact of expectedArtifacts) {
  if (!existsSync(artifact)) {
    console.error(`Missing expected artifact: ${artifact}`);
    process.exit(1);
  }
}

if (process.env.VERBOSE) console.log("Running tests with BUILD_ONCE=1...");
run("node", ["tests/test-unit-shared.mjs"], { BUILD_ONCE: "1" });   // unit
run("node", ["tests/test-integration-graph.mjs"], { BUILD_ONCE: "1" }); // integration
run("node", ["tests/test-e2e-build.mjs"], { BUILD_ONCE: "1" });     // e2e
run("node", ["tests/test-ts-strict.mjs"]);                           // strict gate

if (process.env.VERBOSE) console.log("Running P0-S003 lint tests...");
run("node", ["scripts/test-lint-unit.mjs"]);                         // S003 unit
run("node", ["scripts/test-lint-workspace.mjs"]);                    // S003 integration
run("node", ["scripts/test-precommit-e2e.mjs"]);                     // S003 e2e

if (process.env.VERBOSE) console.log("\nAll tests completed successfully!");