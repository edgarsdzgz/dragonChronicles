import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';

function run(cmd, args, opts) {
  return spawnSync(cmd, args, { encoding: 'utf8', ...opts });
}

// Ensure we're in a git repo with identity set
let r = run('git', ['rev-parse', '--is-inside-work-tree']);
if (r.status !== 0) {
  run('git', ['init']);
  run('git', ['config', 'user.email', 'dev@example.com']);
  run('git', ['config', 'user.name', 'Dev']);
  run('git', ['add', '.']);
  run('git', ['commit', '-m', 'chore(repo): initial']);
}

// create messy file and stage it
const file = 'tests/hooks/messy.ts';
fs.writeFileSync(file, 'export function sum (a:number,b:number){return a+b}\n', 'utf8');
run('git', ['add', file]);

// BAD commit should be rejected by commit-msg hook
r = run('git', ['commit', '-m', 'update some stuff']);
assert.notEqual(r.status, 0, 'Bad message was accepted (commit-msg hook failed)');

// Stage again; GOOD commit should pass
run('git', ['add', file]);
r = run('git', ['commit', '-m', 'feat(repo): enforce conventional commits']);
assert.equal(r.status, 0, 'Good message was not accepted');

// Verify committed file was formatted in the resulting commit
const show = run('git', ['show', 'HEAD:tests/hooks/messy.ts']);
assert.ok(!show.stdout.includes('  '), 'Committed file still has double spaces');
assert.ok(/;\s*$/.test(show.stdout) || show.stdout.includes(';'), 'Committed file missing semicolon');

console.log('E2E: bad rejected, good accepted, file formatted');