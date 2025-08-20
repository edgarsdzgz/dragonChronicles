import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

// Shared constants
export const PATHS = {
  eslintConfig: "configs/eslint/.eslintrc.cjs",
  prettierConfig: "configs/prettier/.prettierrc.cjs",
  eslintIgnore: "configs/eslint/.eslintignore",
  packageJson: "package.json",
  huskyDir: ".husky",
  preCommitHook: ".husky/pre-commit"
};

export const FIXTURES = {
  badTs: "tests/lint/bad.ts",
  badSvelte: "tests/lint/bad.svelte", 
  passTs: "tests/lint/pass.ts",
  passSvelte: "tests/lint/pass.svelte"
};

// Shared utilities
export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readTextFile(path) {
  return readFileSync(path, "utf8");
}

export function fileExists(path) {
  return existsSync(path);
}

export function assertIncludes(content, substring, message) {
  assert.ok(content.includes(substring), message);
}

export function assertExists(path, message) {
  assert.ok(fileExists(path), message || `${path} should exist`);
}