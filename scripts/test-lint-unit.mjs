import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

console.log("UNIT: eslint should fail on bad fixtures…");
let r = run("pnpm", ["exec", "cross-env", "ESLINT_USE_FLAT_CONFIG=false", "eslint", "tests/lint/bad.ts", "tests/lint/bad.svelte", "--config", "configs/eslint/.eslintrc.cjs", "--ext", ".ts,.svelte", "--max-warnings", "0"]);
assert.notEqual(r.code, 0, "ESLint unexpectedly passed for bad files");

console.log("UNIT: prettier --check should fail on bad fixtures…");
r = run("pnpm", ["exec", "prettier", "--config", "configs/prettier/.prettierrc.cjs", "--check", "tests/lint/bad.ts", "tests/lint/bad.svelte"]);
assert.notEqual(r.code, 0, "Prettier unexpectedly passed for bad files");

console.log("UNIT: run format to fix…");
r = run("pnpm", ["run", "format", "--silent"]);
assert.equal(r.code, 0, "format script failed");

console.log("UNIT: after format, eslint should still fail (type rule: no-explicit-any)…");
r = run("pnpm", ["exec", "cross-env", "ESLINT_USE_FLAT_CONFIG=false", "eslint", "tests/lint/bad.ts", "tests/lint/bad.svelte", "--config", "configs/eslint/.eslintrc.cjs", "--ext", ".ts,.svelte"]);
assert.notEqual(r.code, 0, "ESLint passed but should fail due to 'any'");

console.log("UNIT: confirm pass fixture is clean…");
r = run("pnpm", ["exec", "cross-env", "ESLINT_USE_FLAT_CONFIG=false", "eslint", "tests/lint/pass.ts", "--config", "configs/eslint/.eslintrc.cjs", "--ext", ".ts,.svelte", "--max-warnings", "0"]);
assert.equal(r.code, 0, "ESLint failed on pass.ts");

console.log("UNIT: ok");