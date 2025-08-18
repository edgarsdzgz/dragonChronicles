import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function exists(p) { return fs.existsSync(p); }
function must(p) { assert.ok(exists(p), `Missing: ${p}`); }

console.log("E2E: building workspace...");
const r = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b"], { stdio: "inherit" });
assert.equal(r.status, 0, "tsc -b build failed");

[
  "packages/shared/dist/index.js",
  "packages/logger/dist/index.js",
  "packages/db/dist/index.js",
  "packages/sim/dist/index.js",
  "apps/sandbox/dist/index.js"
].forEach(must);

console.log("E2E: running sandbox...");
const run = spawnSync("node", ["apps/sandbox/dist/index.js"], { encoding: "utf8" });
assert.equal(run.status, 0, "sandbox execution failed");
const out = run.stdout.toString().trim();
assert.ok(out.startsWith("{") && out.endsWith("}"), "sandbox did not print JSON");
const json = JSON.parse(out);
assert.equal(json.tick, 1);
assert.match(json.hello, /^logger-ok@/);
assert.equal(typeof json.profile.id, "string");

console.log("E2E: ok");