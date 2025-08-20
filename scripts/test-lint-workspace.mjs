// Validate workspace-level lint configuration and package.json setup for P0-S003
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

console.log("WORKSPACE: Validate package.json workspace lint configuration…");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

// Verify workspace lint script with proper configuration
assert.ok(packageJson.scripts.lint, "package.json must have lint script");
const lintScript = packageJson.scripts.lint;

// Verify lint script uses correct config and flags for P0-S003 requirements
assert.ok(lintScript.includes("eslint"), "lint script must use ESLint");
assert.ok(lintScript.includes("eslint ."), "lint script must run ESLint on all files");
assert.ok(lintScript.includes("--max-warnings 0"), "lint script must enforce zero warnings");

// Verify format scripts
assert.ok(packageJson.scripts.format, "package.json must have format script");
assert.ok(packageJson.scripts.format.includes("prettier"), "format script must use Prettier");
assert.ok(packageJson.scripts.format.includes("configs/prettier/.prettierrc.cjs"), "format script must use correct config");

assert.ok(packageJson.scripts["format:check"], "package.json must have format:check script");
assert.ok(packageJson.scripts["format:check"].includes("--check"), "format:check must use --check flag");

console.log("WORKSPACE: Validate lint-staged configuration…");

// Verify lint-staged exists and has correct rules
assert.ok(packageJson["lint-staged"], "package.json must have lint-staged configuration");
const lintStaged = packageJson["lint-staged"];

// Check ESLint rule for TypeScript and Svelte files
const eslintRule = lintStaged["*.{ts,tsx,js,svelte}"];
assert.ok(Array.isArray(eslintRule) && eslintRule.length > 0, "lint-staged must have ESLint rule for TS/Svelte files");
assert.ok(eslintRule[0].includes("eslint"), "lint-staged ESLint rule must run ESLint");
assert.ok(eslintRule[0].includes("--fix"), "lint-staged ESLint rule must auto-fix issues");

// Check Prettier rule for all supported file types
const prettierRule = lintStaged["*.{ts,tsx,js,json,md,css,scss,svelte}"];
assert.ok(Array.isArray(prettierRule) && prettierRule.length > 0, "lint-staged must have Prettier rule");
assert.ok(prettierRule[0].includes("prettier"), "lint-staged Prettier rule must run Prettier");
assert.ok(prettierRule[0].includes("--write"), "lint-staged Prettier rule must write formatted files");

console.log("WORKSPACE: Validate required dependencies…");

// Verify all required lint dependencies are installed
const devDeps = packageJson.devDependencies;
assert.ok(devDeps.eslint, "eslint must be in devDependencies");
assert.ok(devDeps.prettier, "prettier must be in devDependencies");
assert.ok(devDeps["typescript-eslint"], "typescript-eslint meta package must be in devDependencies");
assert.ok(devDeps["eslint-plugin-svelte"], "eslint-plugin-svelte must be in devDependencies");
assert.ok(devDeps["prettier-plugin-svelte"], "prettier-plugin-svelte must be in devDependencies");
assert.ok(devDeps["eslint-config-prettier"], "eslint-config-prettier must be in devDependencies");

// All assertions passed - workspace configuration validated successfully
// (No unconditional success message - let exit code indicate success)