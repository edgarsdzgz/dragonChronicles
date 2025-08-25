#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Check if package.json changed and sync lockfile
try {
  const changed = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  if (changed.includes('package.json')) {
    console.log('package.json changed -> syncing pnpm-lock.yaml');
    execSync('pnpm -w install --lockfile-only', { stdio: 'inherit' });
    execSync('git add pnpm-lock.yaml');
  }
} catch (error) {
  console.error('Error during pre-commit lockfile sync:', error.message);
  process.exit(1);
}

// Run lint-staged
try {
  execSync('pnpm exec lint-staged', { stdio: 'inherit' });
} catch (error) {
  console.error('lint-staged failed:', error.message);
  process.exit(1);
}