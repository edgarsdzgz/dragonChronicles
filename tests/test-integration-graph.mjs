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
  const mem = createMemoryLogger();
  let captured = "";
  const simLogger = { log: (msg) => { captured += msg; mem.log({ src: "sim", lvl: "info", msg, t: Date.now(), data: {} }); } };

  const out = simulateTick(41, simLogger);
  assert.equal(out, 42);
  assert.ok(captured.includes("41"));         // sim logged something meaningful
  const logs = mem.drain();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].src, "sim");
});

await run();