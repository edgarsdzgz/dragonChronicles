// ESLint 9 flat config: JS + TypeScript (typed) + Svelte + Prettier
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import eslintConfigPrettier from 'eslint-config-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigRootDir = __dirname; // repo root

export default [
  // 1) Ignores (replaces .eslintignore)
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnpm-store/**',
      '**/dist/**',
      '**/dist-tests/**',
      '**/.svelte-kit/**',
      '.husky/_/**',
      '**/eslint.config.*',           // don't lint the config itself
      'configs/**/*.cjs',             // ignore config files
      'tests/fixtures/**',            // ignore test fixtures
      'tests/lint/**',                // ignore lint test files
      '**/*.d.ts',                    // ignore declaration files
    ],
  },

  // 2) Core JS rules with Node.js globals
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
  },

  // 3) JS files: don't use TS plugin; keep core rule with underscore escape
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // 4) TS files: use TS parser + TS rules (typed linting)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { 
        projectService: true, 
        tsconfigRootDir 
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'after-used'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // 5) Svelte recommended (flat)
  ...svelte.configs['flat/recommended'],

  // 6) Svelte TS-in-script + projectService for packages only
  {
    files: ['packages/**/*.svelte', 'apps/**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir,
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      'svelte/no-at-html-tags': 'warn',
    },
  },

  // 7) Prettier last to disable conflicting stylistic rules
  eslintConfigPrettier,
];