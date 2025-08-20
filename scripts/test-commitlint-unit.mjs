import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function pipe(msg) {
  // On Windows, use cmd.exe to execute .CMD files, otherwise use npx
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'cmd' : 'npx';
  const args = isWindows ? ['/c', 'node_modules\\.bin\\commitlint.CMD'] : ['commitlint'];
  
  return spawnSync(cmd, args, { 
    input: msg, 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
    // No shell: true - this causes Windows path issues per CLAUDE.md
  });
}

const good = fs.readFileSync('tests/hooks/commit-good.txt', 'utf8');
const bad = fs.readFileSync('tests/hooks/commit-bad.txt', 'utf8');

const goodRun = pipe(good);
if (goodRun.status !== 0) console.error(goodRun.stdout, goodRun.stderr);
assert.equal(goodRun.status, 0, 'Good message failed commitlint');

const badRun = pipe(bad);
assert.notEqual(badRun.status, 0, 'Bad message unexpectedly passed commitlint');

console.log('UNIT: commitlint good/bad ok');