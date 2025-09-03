// tests/test-e2e-build.mjs
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { test, run } from "./_tiny-runner.mjs";

const must = (p) => assert.ok(fs.existsSync(p), `missing: ${p}`);

if (!process.env.BUILD_ONCE) {
  const r = spawnSync("pnpm", ["-w", "exec", "tsc", "-b"], { stdio: "pipe", encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || "");
    process.exit(r.status ?? 1);
  }
}


test("artifacts exist (coarse)", () => {
  ["packages/shared","packages/logger","packages/db","packages/sim","apps/sandbox"]
    .forEach((pkg) => must(path.join(pkg, "dist")));
});

test("sandbox JSON contract", () => {
  const r = spawnSync("node", ["apps/sandbox/dist/index.js"], { stdio: "pipe", encoding: "utf8" });
  assert.equal(r.status, 0, "sandbox run failed");
  const txt = r.stdout.trim();
  assert.ok(txt.startsWith("{") && txt.endsWith("}"), "stdout not JSON");
  const j = JSON.parse(txt);
  assert.equal(typeof j.tick, "object", "tick should be simulation stats object");
  assert.equal(typeof j.tick.enemies, "number", "tick.enemies should be number");
  assert.equal(typeof j.tick.proj, "number", "tick.proj should be number");
  assert.equal(j.logger, 'ok', 'logger should be ok');
  assert.equal(typeof j.profile.id, "string");
});

await run();