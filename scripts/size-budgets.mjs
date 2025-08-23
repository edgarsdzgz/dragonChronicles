import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const BUDGET_BASE_KB = Number(process.env.BUDGET_BASE_KB || 200);
const BUDGET_LOGGER_KB = Number(process.env.BUDGET_LOGGER_KB || 8);

const targets = [
  { name: 'base', globs: ['apps/web/dist/assets/*.js'] },
  { name: 'logger', globs: ['packages/logger/dist/*.js'] }
];

function gzipSize(buf) { return zlib.gzipSync(buf).length; }

let foundAny = false;
for (const t of targets) {
  const [root] = t.globs[0].split('/'); // naive single glob scan
  const rootDir = path.join(process.cwd(), root);
  if (!fs.existsSync(rootDir)) continue;

  const files = [];
  (function walk(p) {
    for (const f of fs.readdirSync(p)) {
      const fp = path.join(p, f);
      const st = fs.statSync(fp);
      if (st.isDirectory() && !f.includes('node_modules')) walk(fp);
      else if (/\.(js|mjs)$/.test(f) && !fp.includes('node_modules')) files.push(fp);
    }
  })(rootDir);

  if (!files.length) continue;
  foundAny = true;

  for (const f of files) {
    const gz = gzipSize(fs.readFileSync(f)) / 1024;
    const limit = t.name === 'logger' ? BUDGET_LOGGER_KB : BUDGET_BASE_KB;
    const ok = gz <= limit;
    console.log(`${t.name}: ${f} → ${gz.toFixed(1)} KB gz (limit ${limit} KB) ${ok ? 'OK' : 'FAIL'}`);
    if (!ok) process.exitCode = 1;
  }
}

if (!foundAny) {
  console.log('size:check SKIP (no dist found yet)');
}