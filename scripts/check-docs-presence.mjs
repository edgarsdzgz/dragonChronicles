#!/usr/bin/env node

/**
 * Docs Presence Check
 * 
 * Ensures that PRs changing code/tests also update documentation.
 * Fails if changes to packages/, apps/, or tests/ don't include docs/ updates.
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

// Get changed files from git diff
function getChangedFiles() {
  const result = spawnSync("git", ["diff", "--name-only", "HEAD~1"], {
    encoding: "utf8",
    stdio: "pipe"
  });
  
  if (result.status !== 0) {
    console.log("ℹ️  Could not determine git changes (not in git repo or no changes)");
    return [];
  }
  
  return result.stdout.trim().split("\n").filter(Boolean);
}

// Check if file path matches patterns that require docs
function requiresDocs(filePath) {
  const codePatterns = [
    /^packages\//,
    /^apps\//,
    /^tests\//,
    /^scripts\//
  ];
  
  return codePatterns.some(pattern => pattern.test(filePath));
}

// Check if file path is documentation
function isDocumentation(filePath) {
  const docPatterns = [
    /^docs\//,
    /^\.github\//,
    /README\.md$/,
    /\.md$/
  ];
  
  return docPatterns.some(pattern => pattern.test(filePath));
}

function main() {
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log("✅ No files changed, docs check passed");
    process.exit(0);
  }
  
  console.log(`📋 Checking ${changedFiles.length} changed files:`);
  changedFiles.forEach(file => console.log(`  - ${file}`));
  
  const codeChanges = changedFiles.filter(requiresDocs);
  const docChanges = changedFiles.filter(isDocumentation);
  
  if (codeChanges.length === 0) {
    console.log("✅ No code changes requiring documentation updates");
    process.exit(0);
  }
  
  console.log(`\n🔍 Found ${codeChanges.length} code changes requiring docs:`);
  codeChanges.forEach(file => console.log(`  - ${file}`));
  
  if (docChanges.length === 0) {
    console.log("\n❌ Documentation update required but not found");
    console.log("\n📚 Please update relevant documentation:");
    console.log("  - Add/update files in docs/ directory");
    console.log("  - Update engineering standards if processes changed");
    console.log("  - Add ADR if architectural decisions were made");
    console.log("  - See PR template for specific requirements");
    process.exit(1);
  }
  
  console.log(`\n✅ Found ${docChanges.length} documentation updates:`);
  docChanges.forEach(file => console.log(`  - ${file}`));
  console.log("\n✅ Docs presence check passed");
  process.exit(0);
}

main();