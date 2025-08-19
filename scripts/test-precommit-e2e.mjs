import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const tmpFile = path.join("tests", "lint", "commit-bad.ts");
// create an ugly file that is fixable by prettier+eslint --fix
fs.writeFileSync(tmpFile, "const a = { z:1 }\nexport default function F(){return a }");

console.log("E2E: stage file…");
let r = spawnSync("git", ["add", tmpFile], { encoding: "utf8" });
assert.equal(r.status, 0, "git add failed (ensure repo is a git repo)");

console.log("E2E: run pre-commit hook via Husky…");
r = spawnSync("sh", [".husky/pre-commit"], { encoding: "utf8", env: { ...process.env, HUSKY: "1" } });
assert.equal(r.status, 0, "pre-commit hook failed");

console.log("E2E: verify file was formatted (no double spaces, semicolons inserted)…");
const text = fs.readFileSync(tmpFile, "utf8");
assert.ok(!text.includes("  "), "file still contains double spaces");
assert.ok(/;?\n$/.test(text) || text.includes(";"), "file appears unformatted (missing semicolon?)");

console.log("E2E: cleanup staged file…");
spawnSync("git", ["restore", "--staged", tmpFile], { encoding: "utf8" });
fs.unlinkSync(tmpFile);

console.log("E2E: ok");