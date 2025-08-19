import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test, run } from "../tests/_tiny-runner.mjs";

function spawnCmd(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

test("ESLint can run and finds issues in bad fixtures", () => {
  const r = spawnCmd("pnpm", ["exec", "eslint", "tests/lint/bad.ts", "--ext", ".ts"]);
  assert.notEqual(r.code, 0, "ESLint should fail on bad fixtures");
});

test("Prettier can run and finds formatting issues", () => {
  const r = spawnCmd("pnpm", ["exec", "prettier", "--check", "tests/lint/bad.ts"]);
  assert.notEqual(r.code, 0, "Prettier should fail on bad fixtures");
});

test("ESLint passes on good fixtures", () => {
  const r = spawnCmd("pnpm", ["exec", "eslint", "tests/lint/pass.ts", "--ext", ".ts"]);
  assert.equal(r.code, 0, "ESLint should pass on good fixtures");
});

await run();