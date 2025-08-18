import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscPath = require.resolve("typescript/bin/tsc");
const r = spawnSync("node", [tscPath, "-b", "--pretty", "false"], { encoding: "utf8" });
const out = (r.stderr || r.stdout || "").toString();
const exitCode = r.status ?? r.signal ?? 1;

assert.equal(exitCode, 0, `Workspace typecheck (tsc -b) failed with exit code ${exitCode}`);
assert.ok(!/implicitly has an 'any' type/i.test(out), "Found implicit any diagnostics in workspace");
console.log("STRICT workspace typecheck: ok");