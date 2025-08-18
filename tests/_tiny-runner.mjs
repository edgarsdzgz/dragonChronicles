// tests/_tiny-runner.mjs
import assert from "node:assert/strict";

const _cases = [];
export const test = (name, fn) => _cases.push({ name, fn });

export const run = async () => {
  let pass = 0, fail = 0;
  const failures = [];
  for (const t of _cases) {
    try { await t.fn(); pass++; }
    catch (err) { fail++; failures.push({ name: t.name, err }); }
  }
  if (fail === 0) {
    console.log(`ok - ${pass} passed`);
    process.exit(0);
  } else {
    console.error(`FAIL - ${fail} failed, ${pass} passed`);
    for (const f of failures) {
      console.error(`  ✖ ${f.name}: ${f.err?.message || f.err}`);
    }
    process.exit(1);
  }
};