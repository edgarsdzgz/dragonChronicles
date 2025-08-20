// tests/test-unit-shared.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

if (!process.env.BUILD_ONCE) {
  const r = spawnSync("pnpm", ["-w", "exec", "tsc", "-b"], { stdio: "pipe", encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || "");
    process.exit(r.status ?? 1);
  }
}

// Import artifact (better: import source via Vitest later)
const { clamp, DRACONIA_VERSION } = await import("../packages/shared/dist/index.js");

// Fail fast on missing exports
assert.equal(typeof clamp, "function", "clamp should be a function");
assert.equal(typeof DRACONIA_VERSION, "string", "DRACONIA_VERSION should be a string");

test("clamp bounds", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test("version is semver (phase-agnostic)", () => {
  assert.match(DRACONIA_VERSION, /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?$/);
});

await run();