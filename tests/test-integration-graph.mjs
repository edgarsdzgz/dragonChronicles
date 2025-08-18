// tests/test-integration-graph.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscBin = require.resolve("typescript/bin/tsc");

// Build integration packages - skip if BUILD_ONCE=1
if (process.env.BUILD_ONCE !== "1") {
  const built = spawnSync("node", [tscBin, "-b",
    "packages/shared", "packages/logger", "packages/sim"], { stdio: "pipe", encoding: "utf8" });
  assert.equal(built.status, 0, "Build failed for integration packages");
}

const { createMemoryLogger, helloLog } = await import("../packages/logger/dist/index.js");
const { simulateTick } = await import("../packages/sim/dist/index.js");

test("logger contract", () => {
  assert.match(helloLog(), /^logger-ok@/);
});

test("sim integrates with logger", () => {
  const mem = createMemoryLogger();
  let captured = "";
  const simLogger = { log: (msg) => { captured += msg; mem.log({ src: "sim", lvl: "info", msg, t: Date.now(), data: {} }); } };

  const out = simulateTick(41, simLogger);
  assert.equal(out, 42);
  assert.ok(captured.includes("41"));         // sim logged something meaningful
  const logs = mem.drain();
  assert.ok(logs.length >= 1, "Expected at least one log entry");
  assert.equal(logs[0].src, "sim");
});

await run();