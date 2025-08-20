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

  // 3) TS: recommended configs (scoped properly)
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  // 4) TS: type-checked rules *only for TS files in packages* + projectService
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,         // <-- key: supports project refs
        tsconfigRootDir,              // repo root for refs
      },
    },
  })),

  // 5) Custom TS rules for project files
  {
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // 6) Non-type-checked TS rules for scripts/tests
  {
    files: ['scripts/**/*.{js,mjs,ts}', 'tests/**/*.{js,mjs,ts}', '.github/**/*.{js,mjs,ts}'],
    languageOptions: {
      parser: tseslint.parser,
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
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off', // Use TS version instead
    },
  },

  // 7) Svelte recommended (flat)
  ...svelte.configs['flat/recommended'],

  // 8) Svelte TS-in-script + projectService for packages only
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

  // 9) Prettier last to disable conflicting stylistic rules
  eslintConfigPrettier,
];