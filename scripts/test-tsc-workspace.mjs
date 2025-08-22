import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscBin = require.resolve('typescript/bin/tsc');

const r = spawnSync("node", [tscBin, "-b", "--pretty", "false"], { encoding: "utf8" });
const out = (r.stderr || r.stdout || "").toString();
const exitCode = r.status ?? r.signal ?? 1;

assert.equal(exitCode, 0, `Workspace typecheck (tsc -b) failed with exit code ${exitCode}`);
assert.ok(!/implicitly has an 'any' type/i.test(out), "Found implicit any diagnostics in workspace");
// All assertions passed - workspace typecheck completed successfully
// (No unconditional success message - let exit code indicate success)