// tests/test-e2e-build.mjs
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

const must = (p) => assert.ok(fs.existsSync(p), `Missing: ${p}`);

test("build workspace", () => {
  const r = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-b"], { stdio: "inherit" });
  assert.equal(r.status, 0, "tsc -b build failed");
});

test("artifacts exist (coarse check)", () => {
  ["packages/shared", "packages/logger", "packages/db", "packages/sim", "apps/sandbox"]
    .forEach((pkg) => must(path.join(pkg, "dist")));
});

test("sandbox contract", () => {
  const runRes = spawnSync("node", ["apps/sandbox/dist/index.js"], { encoding: "utf8" });
  assert.equal(runRes.status, 0, "sandbox execution failed");
  const out = runRes.stdout.toString().trim();
  assert.ok(out.startsWith("{") && out.endsWith("}"), "sandbox did not print JSON");
  const json = JSON.parse(out);
  assert.equal(json.tick, 1);
  assert.match(json.hello, /^logger-ok@/);
  assert.equal(typeof json.profile.id, "string");
  assert.equal(typeof json.profile.name, "number");
  assert.equal(typeof json.profile.createdAt, "number");
  assert.match(json.v, /^\d+\.\d+\.\d+(-\w+)?$/);
});

await run();