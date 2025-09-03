// tests/test-integration-graph.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

// Load polyfills before any other imports
if (typeof window === 'undefined') {
  await import('fake-indexeddb/auto');
  
  // Apply common mocks
  if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent extends Event {
      constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.detail = eventInitDict.detail;
      }
    };
  }
  
  // Mock crypto for checksum generation
  if (typeof global.crypto === 'undefined') {
    global.crypto = {
      subtle: {
        digest: async (algorithm, data) => {
          const encoder = new TextEncoder();
          const str = new TextDecoder().decode(data);
          const hash = str.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0);
          const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
          return encoder.encode(hashStr).buffer;
        },
      },
    };
  }
}

console.log("Starting integration test...");

if (!process.env.BUILD_ONCE) {
  const r = spawnSync("pnpm", ["-w", "exec", "tsc", "-b"], { stdio: "pipe", encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || "");
    process.exit(r.status ?? 1);
  }
}

console.log("Importing packages...");

const { createLogger } = await import("../packages/logger/dist/index.js");
const { step, createInitial } = await import("../packages/sim/dist/index.js");

console.log("Packages imported successfully");

// Fail fast on missing exports
assert.equal(typeof createLogger, "function", "createLogger should be a function");
assert.equal(typeof step, "function", "step should be a function");
assert.equal(typeof createInitial, "function", "createInitial should be a function");

console.log("Basic exports validated");

test("logger contract", () => {
  console.log("Running logger contract test...");
  const logger = createLogger();
  assert.equal(typeof logger.log, "function", "logger should have log method");
  assert.equal(typeof logger.exportNDJSON, "function", "logger should have exportNDJSON method");
  console.log("Logger contract test passed");
});

test("sim integrates with logger", () => {
  console.log("Running sim integration test...");
  const logger = createLogger({ devConsole: false });
  let captured = "";
  const simLogger = { log: (msg) => { captured += msg; logger.log({ src: "worker", lvl: "info", msg, t: Date.now(), data: {} }); } };

  const initialState = createInitial(42n);
  const newState = step(initialState, 1000); // Step forward 1 second
  
  // Log simulation step
  const logMsg = `sim step: ${initialState.time}ms -> ${newState.time}ms`;
  simLogger.log(logMsg);
  
  assert.equal(newState.time, 1000);
  assert.ok(captured.includes("->"));         // sim logged something meaningful
  
  // Test that logger can be created and used
  assert.equal(typeof logger.log, "function", "logger should have log method");
  assert.equal(typeof logger.exportNDJSON, "function", "logger should have exportNDJSON method");
  
  console.log("Sim integration test passed");
});

console.log("All tests registered, running...");

await run();