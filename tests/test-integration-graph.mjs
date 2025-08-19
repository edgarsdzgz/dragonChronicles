// tests/test-integration-graph.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscBin = require.resolve("typescript/bin/tsc");

if (!process.env.BUILD_ONCE) {
  const r = spawnSync("node", [tscBin, "-b"], { stdio: "pipe", encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || "");
    process.exit(r.status ?? 1);
  }
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
  const simLogs = logs.filter(l => l.src === "sim");
  assert.ok(simLogs.length >= 1, "expected at least one sim log");
  assert.ok(simLogs.some(l => (l.msg || "").includes("->")), "expected meaningful sim message");
});

await run();