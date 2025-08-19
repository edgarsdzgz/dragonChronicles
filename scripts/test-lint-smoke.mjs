import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

console.log("SMOKE: ESLint can run and finds issues in bad fixtures…");
let r = run("pnpm", ["exec", "eslint", "tests/lint/bad.ts", "--ext", ".ts"]);
assert.notEqual(r.code, 0, "ESLint should fail on bad fixtures");

console.log("SMOKE: Prettier can run and finds formatting issues…");
r = run("pnpm", ["exec", "prettier", "--check", "tests/lint/bad.ts"]);
assert.notEqual(r.code, 0, "Prettier should fail on bad fixtures");

console.log("SMOKE: ESLint passes on good fixtures…");
r = run("pnpm", ["exec", "eslint", "tests/lint/pass.ts", "--ext", ".ts"]);
assert.equal(r.code, 0, "ESLint should pass on good fixtures");

console.log("SMOKE: ok");