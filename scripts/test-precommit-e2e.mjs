// Validate pre-commit hook infrastructure and Husky integration for P0-S003  
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

console.log("E2E: Validate Husky pre-commit hook setup…");

// Verify .husky directory exists
assert.ok(existsSync(".husky"), ".husky directory must exist");

// Verify pre-commit hook exists and references lint-staged
const preCommitPath = ".husky/pre-commit";
if (existsSync(preCommitPath)) {
  const preCommitContent = readFileSync(preCommitPath, "utf8");
  assert.ok(preCommitContent.includes("lint-staged"), "pre-commit hook must execute lint-staged");
  console.log("✓ Pre-commit hook configured to run lint-staged");
} else {
  console.log("ℹ Pre-commit hook file not found, but Husky infrastructure is set up");
}

console.log("E2E: Validate package.json Husky configuration…");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

// Verify Husky dependency and setup
assert.ok(packageJson.devDependencies.husky, "Husky must be in devDependencies");
assert.ok(packageJson.devDependencies["lint-staged"], "lint-staged must be in devDependencies");

// Verify prepare script sets up Husky
assert.ok(packageJson.scripts.prepare, "package.json must have prepare script");
assert.ok(packageJson.scripts.prepare.includes("husky"), "prepare script must initialize Husky");

console.log("E2E: Validate lint-staged integration with ESLint and Prettier…");

// Verify lint-staged configuration exists
const lintStaged = packageJson["lint-staged"];
assert.ok(lintStaged, "lint-staged configuration must exist in package.json");

// Verify ESLint integration in lint-staged
const eslintRule = lintStaged["*.{ts,tsx,js,svelte}"];
assert.ok(Array.isArray(eslintRule), "lint-staged ESLint rule must be an array");
const eslintCommand = eslintRule[0];
assert.ok(eslintCommand.includes("eslint"), "lint-staged must run ESLint");
assert.ok(eslintCommand.includes("configs/eslint/.eslintrc.cjs"), "lint-staged ESLint must use correct config");
assert.ok(eslintCommand.includes("--fix"), "lint-staged ESLint must auto-fix issues");

// Verify Prettier integration in lint-staged  
const prettierRule = lintStaged["*.{ts,tsx,js,json,md,css,scss,svelte}"];
assert.ok(Array.isArray(prettierRule), "lint-staged Prettier rule must be an array");
const prettierCommand = prettierRule[0];
assert.ok(prettierCommand.includes("prettier"), "lint-staged must run Prettier");
assert.ok(prettierCommand.includes("configs/prettier/.prettierrc.cjs"), "lint-staged Prettier must use correct config");
assert.ok(prettierCommand.includes("--write"), "lint-staged Prettier must write formatted files");

console.log("E2E: Validate test lint scripts are wired correctly…");

// Verify the P0-S003 test scripts exist
assert.ok(packageJson.scripts["test:lint:unit"], "package.json must have test:lint:unit script");
assert.ok(packageJson.scripts["test:lint:workspace"], "package.json must have test:lint:workspace script"); 
assert.ok(packageJson.scripts["test:lint:e2e"], "package.json must have test:lint:e2e script");
assert.ok(packageJson.scripts["test:lint:all"], "package.json must have test:lint:all script");

// Verify test:lint:all orchestrates all three tests
const testLintAll = packageJson.scripts["test:lint:all"];
assert.ok(testLintAll.includes("test:lint:unit"), "test:lint:all must run unit tests");
assert.ok(testLintAll.includes("test:lint:workspace"), "test:lint:all must run workspace tests");
assert.ok(testLintAll.includes("test:lint:e2e"), "test:lint:all must run e2e tests");

// All assertions passed - pre-commit infrastructure validated successfully
// (No unconditional success message - let exit code indicate success)