import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscPath = require.resolve("typescript/bin/tsc");

test("strict should PASS on good.ts", () => {
  const r = spawnSync("node", [tscPath, "-p", "tests/ts-strict/tsconfig.strict.should-pass.json"], { stdio: "pipe" });
  assert.equal(r.status, 0, "expected pass config to compile cleanly");
});

test("strict should FAIL on bad-implicit-any.ts", () => {
  const r = spawnSync("node", [tscPath, "-p", "tests/ts-strict/tsconfig.strict.should-fail.json"], { encoding: "utf8" });
  assert.notEqual(r.status, 0, "expected fail config to fail compilation");
  // optional (non-brittle): assert the stderr mentions TS7006 or TS7031
  const err = (r.stderr || r.stdout || "").toString();
  assert.ok(err.includes("TS7006") || err.includes("TS7031"), "expected an implicit any error");
});

await run();