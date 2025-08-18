#!/usr/bin/env node

// .github/scripts/require-docs-change.mjs
import { execSync } from "node:child_process";

const base = process.env.GITHUB_BASE_REF || "origin/main";
const diff = execSync(`git diff --name-only ${base}...HEAD`, { encoding: "utf8" })
  .split("\n").filter(Boolean);

const codeTouched = diff.some(p => p.startsWith("packages/") || p.startsWith("apps/") || p.startsWith("tests/"));
const docsTouched = diff.some(p => p.startsWith("docs/") || p.startsWith(".github/pull_request_template.md"));

if (codeTouched && !docsTouched) {
  console.error("Docs required: changes in packages/apps/tests must include updates under /docs or ADRs.");
  process.exit(1);
}

console.log("✅ Docs presence check passed");
process.exit(0);