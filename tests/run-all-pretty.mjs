// Enhanced test runner with pretty output
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs';
import { Runner } from './utils/prettyRunner.mjs';

const r = new Runner('Node checks');

const run = (cmd, args, env = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return result;
};

// Build section
const secBuild = r.section('E2E Build');
if (process.env.VERBOSE) console.log('Building TypeScript projects.');

const tscPath = 'node_modules/.pnpm/typescript@5.9.2/node_modules/typescript/lib/tsc.js';

try {
  // Clean + build
  const cleanResult = run('node', [tscPath, '-b', '--clean']);
  if (cleanResult.status !== 0) {
    secBuild.fail('TypeScript clean', cleanResult.stderr);
  } else {
    const buildResult = run('node', [tscPath, '-b', 'tsconfig.build.json', '--pretty', 'false']);
    if (buildResult.status !== 0) {
      secBuild.fail('TypeScript build', buildResult.stderr);
    } else {
      // Verify artifacts
      const expectedArtifacts = [
        'packages/shared/dist/index.js',
        'packages/logger/dist/index.js', 
        'packages/db/dist/index.js',
        'packages/sim/dist/index.js',
        'apps/sandbox/dist/index.js'
      ];
      
      let artifactsMissing = 0;
      for (const artifact of expectedArtifacts) {
        if (!existsSync(artifact)) {
          secBuild.fail(`Missing artifact: ${artifact}`);
          artifactsMissing++;
        }
      }
      
      if (artifactsMissing === 0) {
        secBuild.pass('TypeScript build + artifacts');
      }
    }
  }
} catch (err) {
  secBuild.fail('build process', err);
}

// Unit tests section
const secUnit = r.section('Unit Tests');
try {
  const unitResult = run('node', ['tests/test-unit-shared.mjs'], { BUILD_ONCE: '1' });
  if (unitResult.status === 0) {
    secUnit.pass('shared utilities');
  } else {
    secUnit.fail('shared utilities', unitResult.stderr);
  }
} catch (err) {
  secUnit.fail('shared utilities', err);
}

// Integration tests section  
const secIntegration = r.section('Integration Tests');
try {
  const integrationResult = run('node', ['tests/test-integration-graph.mjs'], { BUILD_ONCE: '1' });
  if (integrationResult.status === 0) {
    secIntegration.pass('logger↔sim wiring');
  } else {
    secIntegration.fail('logger↔sim wiring', integrationResult.stderr);
  }
} catch (err) {
  secIntegration.fail('logger↔sim wiring', err);
}

// W5 Logger Integration Tests
try {
  const loggerIntegrationResult = run('node', ['tests/test-logger-integration.mjs'], { BUILD_ONCE: '1' });
  if (loggerIntegrationResult.status === 0) {
    secIntegration.pass('W5 logger integration');
  } else {
    secIntegration.fail('W5 logger integration', loggerIntegrationResult.stderr);
  }
} catch (err) {
  secIntegration.fail('W5 logger integration', err);
}

// E2E tests section
const secE2E = r.section('E2E Tests');
try {
  const e2eResult = run('node', ['tests/test-e2e-build.mjs'], { BUILD_ONCE: '1' });
  if (e2eResult.status === 0) {
    secE2E.pass('CLI contracts');
  } else {
    secE2E.fail('CLI contracts', e2eResult.stderr);
  }
} catch (err) {
  secE2E.fail('CLI contracts', err);
}

// TypeScript strict gate
const secStrict = r.section('TypeScript Strict Gate');
try {
  const strictResult = run('node', ['tests/test-ts-strict.mjs']);
  if (strictResult.status === 0) {
    secStrict.pass('strict pass + fail detection');
  } else {
    secStrict.fail('strict pass + fail detection', strictResult.stderr);
  }
} catch (err) {
  secStrict.fail('strict pass + fail detection', err);
}

// Render tests section
const secRender = r.section('Render Tests (W2)');
try {
  const renderResult = run('node', ['tests/render-node.mjs']);
  if (renderResult.status === 0) {
    secRender.pass('W2 gap coverage (HUD, displayPool, background, paths)');
  } else {
    secRender.fail('W2 gap coverage', renderResult.stderr);
  }
} catch (err) {
  secRender.fail('W2 gap coverage', err);
}

// Lint tests (if they exist)
const secLint = r.section('Lint Tests (S003)');
const lintScripts = [
  'scripts/test-lint-unit.mjs',
  'scripts/test-lint-workspace.mjs', 
  'scripts/test-precommit-e2e.mjs'
];

for (const script of lintScripts) {
  if (existsSync(script)) {
    try {
      const lintResult = run('node', [script]);
      if (lintResult.status === 0) {
        secLint.pass(script.split('/').pop().replace('.mjs', ''));
      } else {
        secLint.fail(script.split('/').pop().replace('.mjs', ''), lintResult.stderr);
      }
    } catch (err) {
      secLint.fail(script.split('/').pop().replace('.mjs', ''), err);
    }
  } else {
    secLint.skip(script.split('/').pop().replace('.mjs', ''), 'script not found');
  }
}

// Write summary for global aggregator
const nodeSummary = r.summary();
fs.mkdirSync('tests/.artifacts', { recursive: true });
fs.writeFileSync('tests/.artifacts/node.json', JSON.stringify(nodeSummary, null, 2));

// Exit with proper code
if (nodeSummary.failed > 0) {
  process.exit(1);
}