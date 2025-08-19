// tests/run-all.mjs
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscBin = require.resolve("typescript/bin/tsc");

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) {
    if (r.stdout) console.log(r.stdout);
    if (r.stderr) console.error(r.stderr);
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

console.log("Building TypeScript projects...");
if (projects.length === 0) {
  // Fallback: root build if no per-package tsconfigs were found
  run("node", [tscBin, "-b"]);
} else {
  // One multi-project build (tsc -b resolves proper order)
  run("node", [tscBin, "-b", ...projects]);
}

console.log("Verifying build artifacts...");
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

console.log("Running tests with BUILD_ONCE=1...");
run("node", ["tests/test-unit-shared.mjs"], { BUILD_ONCE: "1" });   // unit
run("node", ["tests/test-integration-graph.mjs"], { BUILD_ONCE: "1" }); // integration
run("node", ["tests/test-e2e-build.mjs"], { BUILD_ONCE: "1" });     // e2e
run("node", ["tests/test-ts-strict.mjs"]);                           // strict gate

console.log("\nAll tests completed successfully!");