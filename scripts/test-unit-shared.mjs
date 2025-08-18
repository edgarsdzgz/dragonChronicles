import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// Build only the shared package to test source
const buildResult = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b", "packages/shared"], { stdio: "inherit" });
assert.equal(buildResult.status, 0, "Failed to build shared package for unit test");

// Now import the fresh build (this ensures we're testing current source, not stale artifacts)
const { clamp, DRACONIA_VERSION } = await import("../packages/shared/dist/index.js");

assert.equal(clamp(5, 0, 10), 5);
assert.equal(clamp(-1, 0, 10), 0);
assert.equal(clamp(11, 0, 10), 10);

// Loosen version assertion to be phase-independent
assert.match(DRACONIA_VERSION, /^\d+\.\d+\.\d+(-\w+)?$/);

console.log("UNIT(shared): ok");