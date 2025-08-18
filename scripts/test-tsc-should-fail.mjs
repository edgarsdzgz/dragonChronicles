import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscPath = require.resolve("typescript/bin/tsc");
const r = spawnSync("node", [tscPath, "-p", "tests/ts-strict/tsconfig.strict.should-fail.json", "--pretty", "false"], { encoding: "utf8" });
const exitCode = r.status ?? r.signal ?? 0;
const out = (r.stderr || r.stdout || "").toString();

assert.notEqual(exitCode, 0, "Expected tsc to FAIL for bad-implicit-any.ts");
const has7006 = out.includes("TS7006"); // parameter implicitly has 'any'
const has7031 = out.includes("TS7031"); // binding element implicitly has 'any'
assert.ok(has7006 || has7031, "Expected implicit-any diagnostic (TS7006/TS7031) in output");
console.log("STRICT should-fail: ok");