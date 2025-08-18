// tests/test-integration-graph.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

const built = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b",
  "packages/shared", "packages/logger", "packages/sim"], { stdio: "inherit" });
assert.equal(built.status, 0, "Build failed for integration packages");

const { createMemoryLogger, helloLog } = await import("../packages/logger/dist/index.js");
const { simulateTick } = await import("../packages/sim/dist/index.js");

test("logger contract", () => {
  assert.match(helloLog(), /^logger-ok@/);
});

test("sim integrates with logger", () => {
  const logger = createMemoryLogger();
  let captured = "";
  const simLogger = {
    log: (msg) => { captured += msg; logger.log({ t: Date.now(), lvl: "info", src: "sim", msg, data: {} }); }
  };

  const result = simulateTick(41, simLogger);
  assert.equal(result, 42);
  assert.ok(captured.includes("41 -> 42"));

  const logs = logger.drain();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].src, "sim");
  assert.ok(logs[0].msg.includes("41 -> 42"));
});

await run();