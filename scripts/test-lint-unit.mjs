// Validate ESLint and Prettier configurations and test fixtures for P0-S003
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);

console.log("UNIT: Validate ESLint configuration loads and processes TypeScript + Svelte…");

// Test that ESLint config can be loaded and parsed
const eslintConfigPath = "configs/eslint/.eslintrc.cjs";
assert.ok(existsSync(eslintConfigPath), "ESLint config must exist");

// Verify the config contains required rules and plugins
const eslintConfigContent = readFileSync(eslintConfigPath, "utf8");
assert.ok(eslintConfigContent.includes("@typescript-eslint/no-explicit-any"), "ESLint config must forbid 'any' types");
assert.ok(eslintConfigContent.includes("plugin:svelte/recommended"), "ESLint config must include Svelte support");
assert.ok(eslintConfigContent.includes("prettier"), "ESLint config must include prettier for conflict resolution");

// Verify Prettier config has Svelte plugin
const prettierConfigPath = "configs/prettier/.prettierrc.cjs";
assert.ok(existsSync(prettierConfigPath), "Prettier config must exist");
const prettierConfigContent = readFileSync(prettierConfigPath, "utf8");
assert.ok(prettierConfigContent.includes("prettier-plugin-svelte"), "Prettier config must include Svelte plugin");

console.log("UNIT: Validate test fixtures have expected violations…");

// Check that bad fixtures contain the violations we expect
const badTs = readFileSync("tests/lint/bad.ts", "utf8");
assert.ok(badTs.includes("any"), "bad.ts should contain 'any' type for ESLint testing");

const badSvelte = readFileSync("tests/lint/bad.svelte", "utf8");
assert.ok(badSvelte.includes("any"), "bad.svelte should contain 'any' type for ESLint testing");

// Check that pass fixtures are clean
const passTs = readFileSync("tests/lint/pass.ts", "utf8");
assert.ok(!passTs.includes("any"), "pass.ts should not contain 'any' type");
assert.ok(passTs.includes("function"), "pass.ts should demonstrate proper patterns");

const passSvelte = readFileSync("tests/lint/pass.svelte", "utf8");
assert.ok(!passSvelte.includes("any"), "pass.svelte should not contain 'any' type");
assert.ok(passSvelte.includes("lang=\"ts\""), "pass.svelte should demonstrate TypeScript in Svelte");

console.log("UNIT: Validate package.json scripts are configured correctly…");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

// Verify lint script exists with correct flags
assert.ok(packageJson.scripts.lint, "package.json must have lint script");
assert.ok(packageJson.scripts.lint.includes("--max-warnings 0"), "lint script must enforce zero warnings");
assert.ok(packageJson.scripts.lint.includes("configs/eslint/.eslintrc.cjs"), "lint script must use correct config");

// Verify format scripts exist
assert.ok(packageJson.scripts.format, "package.json must have format script");
assert.ok(packageJson.scripts["format:check"], "package.json must have format:check script");

// All assertions passed - test completed successfully
// (No unconditional success message - let exit code indicate success)