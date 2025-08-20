import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const file = 'tests/hooks/messy.ts';
fs.writeFileSync(file, 'export function sum (a:number,b:number){return a+b}\n', 'utf8');

let r = spawnSync('git', ['add', file], { encoding: 'utf8' });
assert.equal(r.status, 0, 'git add failed (ensure repo is a git repo)');

// Run the hook directly (v9+ hook is just a command snippet)
// On Windows, use cmd.exe to execute .CMD files, otherwise use sh
const isWindows = process.platform === 'win32';
if (isWindows) {
  // On Windows, run lint-staged directly via .CMD file
  r = spawnSync('cmd', ['/c', 'node_modules\\.bin\\lint-staged.CMD'], { encoding: 'utf8' });
} else {
  r = spawnSync('sh', ['.husky/pre-commit'], { encoding: 'utf8' });
}
console.log('Lint-staged result:', { status: r.status, stdout: r.stdout, stderr: r.stderr });
assert.equal(r.status, 0, 'pre-commit hook failed (lint-staged/ESLint/Prettier error?)');

const text = fs.readFileSync(file, 'utf8');
assert.ok(!text.includes('  '), 'file still contains double spaces');
assert.ok(/;\s*$/.test(text) || text.includes(';'), 'missing semicolon indicates not formatted');

console.log('INTEGRATION: pre-commit formatted staged file');