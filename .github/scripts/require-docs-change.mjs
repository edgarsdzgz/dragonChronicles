#!/usr/bin/env node
import { execSync } from 'node:child_process';

function sh(cmd) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch { return null; }
}

function requireNonEmpty(val, name) {
  if (!val) throw new Error(`${name} is empty`);
  return val;
}

// Determine diff range robustly
const event = process.env.GITHUB_EVENT_NAME || '';
const envBaseRef = process.env.GITHUB_BASE_REF || '';            // e.g. 'main' on PRs
const prBaseSha = process.env.PR_BASE_SHA || '';
const prHeadSha = process.env.PR_HEAD_SHA || '';

// Ensure we have full history (no-op if already unshallowed)
sh('git fetch --unshallow 2>/dev/null || true');

// Figure out a base and head we can diff
let baseRef = 'origin/main';
let headRef = 'HEAD';

if (event === 'pull_request') {
  // Prefer exact SHAs provided by GH for PRs (works even from forks)
  if (prBaseSha && prHeadSha) {
    baseRef = prBaseSha;
    headRef = prHeadSha;
  } else if (envBaseRef) {
    baseRef = `origin/${envBaseRef}`;
    // Make sure we have it
    sh(`git fetch origin +refs/heads/${envBaseRef}:refs/remotes/origin/${envBaseRef}`);
  }
} else {
  // Push to default branch or branch builds:
  // Fall back through known defaults if origin/main is missing
  if (!sh(`git rev-parse --verify ${baseRef}`)) {
    if (sh('git rev-parse --verify origin/master')) baseRef = 'origin/master';
    else if (sh('git rev-parse --verify HEAD~1'))   baseRef = 'HEAD~1';  // first commit scenario
  }
}

// Verify refs are valid
requireNonEmpty(sh(`git rev-parse --verify ${baseRef}`), `Base ref ${baseRef}`);
requireNonEmpty(sh(`git rev-parse --verify ${headRef}`), `Head ref ${headRef}`);

// Compute changed files safely
let changed = sh(`git diff --name-only ${baseRef}...${headRef}`);
if (!changed) {
  // As a final fallback, try a two-dot range
  changed = sh(`git diff --name-only ${baseRef} ${headRef}`) || '';
}

const files = changed.split('\n').filter(Boolean);

// Define what counts as "docs"
const _DOCS_GLOBS = [
  'docs/',                 // anything under docs/
  '*.md',                  // top-level markdown
  '**/*.md',               // markdown anywhere
];

// Simple glob-ish check without deps
function matchesDocs(path) {
  if (path.startsWith('docs/')) return true;
  return path.endsWith('.md');
}

// Define what counts as "code" changes requiring docs
function matchesCode(path) {
  return path.startsWith('packages/') || 
         path.startsWith('apps/') || 
         path.startsWith('tests/');
}

const touchedDocs = files.filter(matchesDocs);
const touchedCode = files.filter(matchesCode);

// Output a helpful summary
console.log('Changed files:\n' + (files.join('\n') || '(none)'));
console.log('\nCode-related changes:\n' + (touchedCode.join('\n') || '(none)'));
console.log('\nDocs‑related changes:\n' + (touchedDocs.join('\n') || '(none)'));

// Enforce rule
if (touchedCode.length > 0 && touchedDocs.length === 0) {
  console.error('\n❌ This change modifies code but no docs/markdown were updated. Please update docs or add an exemption.');
  process.exit(1);
} else {
  console.log('\n✅ Docs requirement satisfied (or no code changes requiring docs).');
}