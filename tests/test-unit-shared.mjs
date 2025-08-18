// tests/test-unit-shared.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

// (Temporary) build the package you're testing
const built = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b", "packages/shared"], { stdio: "inherit" });
assert.equal(built.status, 0, "Build failed for packages/shared");

// Import artifact (better: import source via Vitest later)
const { clamp, DRACONIA_VERSION } = await import("../packages/shared/dist/index.js");

test("clamp bounds", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test("version is semver (phase-agnostic)", () => {
  assert.match(DRACONIA_VERSION, /^\d+\.\d+\.\d+(-\w+)?$/);
});

await run();