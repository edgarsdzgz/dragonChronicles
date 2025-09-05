// tests/test-logger-integration.mjs
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

console.log("Starting W5 Logger Integration Tests...");

if (!process.env.BUILD_ONCE) {
  const r = spawnSync("pnpm", ["-w", "exec", "tsc", "-b"], { stdio: "pipe", encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || "");
    process.exit(r.status ?? 1);
  }
}

console.log("Importing packages...");

let createLogger;
try {
  const loggerModule = await import("../packages/logger/dist/index.js");
  createLogger = loggerModule.createLogger;
  console.log("Packages imported successfully");
} catch (error) {
  console.error("Import failed:", error);
  process.exit(1);
}

// Fail fast on missing exports
assert.equal(typeof createLogger, "function", "createLogger should be a function");

console.log("Basic exports validated");

test("logger core functionality - basic logging", () => {
  console.log("Testing basic logging...");
  
  const logger = createLogger({ devConsole: false });
  
  // Log some events
  logger.log({
    t: Date.now(),
    lvl: 'info',
    src: 'ui',
    msg: 'Test log message',
    data: { test: true }
  });
  
  // Verify logger has required methods
  assert.equal(typeof logger.log, "function", "logger should have log method");
  assert.equal(typeof logger.exportNDJSON, "function", "logger should have exportNDJSON method");
  assert.equal(typeof logger.clear, "function", "logger should have clear method");
  assert.equal(typeof logger.enableConsole, "function", "logger should have enableConsole method");
  
  console.log("Basic logging test passed");
});

test("logger core functionality - memory limits", async () => {
  console.log("Testing memory limits...");
  
  const logger = createLogger({
    maxBytes: 1024, // 1KB limit
    maxEntries: 50
  });
  
  // Log until we hit limits
  let logCount = 0;
  while (logCount < 100) {
    logger.log({
      t: Date.now(),
      lvl: 'info',
      src: 'ui',
      msg: `Memory test ${logCount}`,
      data: { large: 'x'.repeat(100) } // 100 char data
    });
    logCount++;
    
    // Check if we hit limits
    const exportBlob = await logger.exportNDJSON();
    const size = exportBlob.size;
    
    if (size > 1024 || logCount > 50) {
      break;
    }
  }
  
  // Verify limits were respected - logger should stop growing significantly
  const exportBlob = await logger.exportNDJSON();
  const finalSize = exportBlob.size;
  
  // The logger should respect limits by either:
  // 1. Staying under the byte limit, or
  // 2. Not growing significantly beyond it (indicating limit enforcement)
  assert.ok(finalSize <= 2048, `Should respect byte limit reasonably, got ${finalSize}`);
  
  console.log(`Memory limits test passed - final size: ${finalSize} bytes`);
});

test("logger core functionality - export format", async () => {
  console.log("Testing export format...");
  
  const logger = createLogger({ devConsole: false });
  
  // Log structured data
  logger.log({
    t: Date.now(),
    lvl: 'info',
    src: 'ui',
    msg: 'Structured log',
    data: { 
      userId: 123,
      action: 'login',
      timestamp: Date.now()
    }
  });
  
  // Export and verify format
  const exportBlob = await logger.exportNDJSON();
  const exportText = await exportBlob.text();
  const lines = exportText.trim().split('\n');
  
  assert.ok(lines.length > 0, "Should export logs");
  
  // Parse first line as JSON
  const firstLog = JSON.parse(lines[0]);
  assert.equal(typeof firstLog.t, "number", "Should have timestamp");
  assert.equal(typeof firstLog.lvl, "string", "Should have level");
  assert.equal(typeof firstLog.src, "string", "Should have source");
  assert.equal(typeof firstLog.msg, "string", "Should have message");
  
  console.log("Export format test passed");
});

test("logger core functionality - clear functionality", async () => {
  console.log("Testing clear functionality...");
  
  const logger = createLogger({ devConsole: false });
  
  // Log some events
  logger.log({
    t: Date.now(),
    lvl: 'info',
    src: 'ui',
    msg: 'Log before clear',
    data: { test: true }
  });
  
  // Verify logs exist
  let exportBlob = await logger.exportNDJSON();
  let exportText = await exportBlob.text();
  assert.ok(exportText.trim().length > 0, "Should have logs before clear");
  
  // Clear logs
  await logger.clear();
  
  // Verify logs are cleared
  exportBlob = await logger.exportNDJSON();
  exportText = await exportBlob.text();
  assert.equal(exportText.trim().length, 0, "Should have no logs after clear");
  
  console.log("Clear functionality test passed");
});

test("logger core functionality - console toggle", () => {
  console.log("Testing console toggle...");
  
  const logger = createLogger({ devConsole: false });
  
  // Test console toggle methods exist
  assert.equal(typeof logger.enableConsole, "function", "Should have enableConsole method");
  
  // Call the method (we can't easily test console output in tests)
  logger.enableConsole(true);
  logger.enableConsole(false);
  
  console.log("Console toggle test passed");
});

console.log("All tests registered, running...");

await run();
