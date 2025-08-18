import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")} failed`);
  return r;
};

// Build workspace using TypeScript directly to avoid shell issues
console.log("E2E: building workspace...");
run("node", ["./node_modules/typescript/bin/tsc", "-b"]);

// Probe for at least one artifact per workspace without hard-coding full list
const must = (p) => assert.ok(fs.existsSync(p), `Missing: ${p}`);
["packages/shared", "packages/logger", "packages/db", "packages/sim", "apps/sandbox"]
  .forEach((pkg) => must(path.join(pkg, "dist")));

console.log("E2E: running sandbox...");
const runResult = spawnSync("node", ["apps/sandbox/dist/index.js"], { encoding: "utf8" });
assert.equal(runResult.status, 0, "sandbox execution failed");
const out = runResult.stdout.toString().trim();
assert.ok(out.startsWith("{") && out.endsWith("}"), "sandbox did not print JSON");

const json = JSON.parse(out);
// Test the contract, not exact values
assert.equal(json.tick, 1);
assert.match(json.hello, /^logger-ok@/);
assert.equal(typeof json.profile.id, "string");
assert.equal(typeof json.profile.name, "number");
assert.equal(typeof json.profile.createdAt, "number");
assert.match(json.v, /^\d+\.\d+\.\d+(-\w+)?$/);

console.log("E2E(build+cli): ok");