import fs from 'node:fs';
import assert from 'node:assert/strict';

function mustContain(path, needle) {
  const txt = fs.readFileSync(path, 'utf8');
  assert.ok(txt.includes(needle), `${path} must contain: ${needle}`);
  return txt;
}

function mustNotContain(txt, path, needle) {
  assert.ok(!txt.includes(needle), `${path} must NOT contain: ${needle}`);
}

const pre = '.husky/pre-commit';
const msg = '.husky/commit-msg';

const preTxt = mustContain(pre, 'pnpm exec lint-staged');
mustNotContain(preTxt, pre, '#!/usr/bin/env sh');
mustNotContain(preTxt, pre, 'husky.sh');

const msgTxt = mustContain(msg, 'pnpm exec commitlint --edit "$1"');
mustNotContain(msgTxt, msg, '#!/usr/bin/env sh');
mustNotContain(msgTxt, msg, 'husky.sh');

console.log('AUDIT: Husky v9+ format ok');