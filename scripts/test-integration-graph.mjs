import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// Build only the packages we need for integration test
const buildResult = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b", "packages/shared", "packages/logger", "packages/sim"], { stdio: "inherit" });
assert.equal(buildResult.status, 0, "Failed to build packages for integration test");

// Import fresh builds
const { createMemoryLogger, helloLog } = await import("../packages/logger/dist/index.js");
const { simulateTick } = await import("../packages/sim/dist/index.js");

// Test actual integration: sim using logger
const logger = createMemoryLogger();
let captured = "";

// Create adapter for sim's logger interface
const simLogger = {
  log: (msg) => {
    captured += msg;
    logger.log({
      t: Date.now(),
      lvl: "info",
      src: "sim",
      msg,
      data: {}
    });
  }
};

// Test the integration
const result = simulateTick(41, simLogger);
assert.equal(result, 42, "simulateTick should return 42");
assert.ok(captured.includes("simulateTick: 41 -> 42"), "simulateTick should log to provided logger");

// Verify logger captured the interaction
const logs = logger.drain();
assert.equal(logs.length, 1, "Logger should have captured one log entry");
assert.equal(logs[0].src, "sim", "Log should be from sim package");
assert.ok(logs[0].msg.includes("41 -> 42"), "Log should contain the tick transformation");

// Sanity: logger's own contract
assert.match(helloLog(), /^logger-ok@/);

console.log("INTEGRATION(graph): ok");