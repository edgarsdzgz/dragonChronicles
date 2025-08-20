import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const BASE = JSON.parse(fs.readFileSync(path.join(ROOT, "tsconfig.base.json"), "utf8"));

function expect(obj, pathStr, val) {
  const segs = pathStr.split(".");
  let cur = obj;
  for (const s of segs) cur = (cur ?? {})[s];
  assert.equal(cur, val, `Expected ${pathStr} === ${val}, got ${cur}`);
}

console.log("AUDIT: tsconfig.base.json strict flags…");
expect(BASE, "compilerOptions.strict", true);
expect(BASE, "compilerOptions.noImplicitAny", true);
expect(BASE, "compilerOptions.exactOptionalPropertyTypes", true);
expect(BASE, "compilerOptions.noUncheckedIndexedAccess", true);
expect(BASE, "compilerOptions.noFallthroughCasesInSwitch", true);

const PACKS = [
  "packages/shared", "packages/logger", "packages/db", "packages/sim", "apps/sandbox"
];
for (const p of PACKS) {
  const cfgPath = path.join(ROOT, p, "tsconfig.json");
  const j = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  assert.equal(j.extends, "../../tsconfig.base.json", `${p} must extend base tsconfig`);
  const bad = j?.compilerOptions && (
    "strict" in j.compilerOptions ||
    "noImplicitAny" in j.compilerOptions ||
    "exactOptionalPropertyTypes" in j.compilerOptions
  );
  assert.equal(bad, false, `${p} must NOT override strict flags in its tsconfig`);
}
// All assertions passed - tsconfig audit completed successfully
// (No unconditional success message - let exit code indicate success)