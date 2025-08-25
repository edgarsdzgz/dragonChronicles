import fs from 'node:fs';

const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);

const node = readJSON('tests/.artifacts/node.json') || { total: 0, passed: 0, failed: 0 };
const vitest = readJSON('tests/.artifacts/vitest.json');

let vitestTotals = { total: 0, passed: 0, failed: 0 };
if (vitest && Array.isArray(vitest.testResults)) {
  for (const file of vitest.testResults) {
    if (file.assertionResults) {
      vitestTotals.total += file.assertionResults.length;
      for (const a of file.assertionResults) {
        if (a.status === 'passed') vitestTotals.passed++;
        else if (a.status === 'failed') vitestTotals.failed++;
      }
    }
  }
} else if (vitest && vitest.numTotalTests) {
  // Alternative vitest JSON format
  vitestTotals.total = vitest.numTotalTests;
  vitestTotals.passed = vitest.numPassedTests || 0;
  vitestTotals.failed = vitest.numFailedTests || 0;
}

// Show Vitest status
if (vitestTotals.total === 0) {
  console.log('Note: Vitest tests were skipped (installation or configuration issue)');
}

const grand = {
  total: node.total + vitestTotals.total,
  passed: node.passed + vitestTotals.passed,
  failed: node.failed + vitestTotals.failed,
};

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
console.log(
  `\n${bold('GLOBAL SUMMARY')} — ${grand.passed}/${grand.total} passed, ${grand.failed} failed`
);

// Non-zero exit if anything failed
if (grand.failed > 0) process.exit(1);