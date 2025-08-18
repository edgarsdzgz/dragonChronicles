// tests/test-e2e-build.mjs
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tscBin = require.resolve("typescript/bin/tsc");

const must = (p) => assert.ok(fs.existsSync(p), `missing: ${p}`);

test("workspace builds", () => {
  // Skip if BUILD_ONCE=1 (assume already built)
  if (process.env.BUILD_ONCE === "1") {
    return; // Skip build, assume artifacts exist
  }
  const r = spawnSync("node", [tscBin, "-b"], { stdio: "pipe", encoding: "utf8" });
  assert.equal(r.status, 0, "tsc -b failed");
});

test("artifacts exist (coarse)", () => {
  ["packages/shared","packages/logger","packages/db","packages/sim","apps/sandbox"]
    .forEach((pkg) => must(path.join(pkg, "dist")));
});

test("sandbox JSON contract", () => {
  const r = spawnSync("node", ["apps/sandbox/dist/index.js"], { encoding: "utf8" });
  assert.equal(r.status, 0, "sandbox run failed");
  const txt = r.stdout.trim();
  assert.ok(txt.startsWith("{") && txt.endsWith("}"), "stdout not JSON");
  const j = JSON.parse(txt);
  assert.equal(j.tick, 1);
  assert.match(j.hello, /^logger-ok@/);
  assert.equal(typeof j.profile.id, "string");
});

await run();