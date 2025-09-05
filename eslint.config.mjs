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
      '**/build/**',                  // ignore build artifacts
      '**/apps/web/build/**',         // ignore SvelteKit build
      '**/apps/web/.svelte-kit/**',   // ignore SvelteKit cache
      '.husky/_/**',
      '**/eslint.config.*',           // don't lint the config itself
      'configs/**/*.cjs',             // ignore config files
      'tests/fixtures/**',            // ignore test fixtures
      'tests/lint/**',                // ignore lint test files
      'tests/hooks/**',               // ignore hook test files
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
        NodeJS: 'readonly',
      },
    },
  },

  // 2.5) Browser environment for web app files
  {
    files: ['apps/web/**/*.{js,ts,svelte}', 'packages/**/*.{js,ts,svelte}'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        queueMicrotask: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        XMLSerializer: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        crypto: 'readonly',
        indexedDB: 'readonly',
        CustomEvent: 'readonly',
        CustomEventInit: 'readonly',
        Event: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        BroadcastChannel: 'readonly',
        addEventListener: 'readonly',
        dispatchEvent: 'readonly',
        // Service Worker globals
        self: 'readonly',
        importScripts: 'readonly',
        workbox: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        // PWA globals
        OffscreenCanvas: 'readonly',
      },
    },
  },

  // 2.6) Test files environment
  {
    files: ['tests/**/*.{js,ts,mjs}', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
    languageOptions: {
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        // Browser globals for tests
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        queueMicrotask: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        XMLSerializer: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        crypto: 'readonly',
        indexedDB: 'readonly',
        CustomEvent: 'readonly',
        CustomEventInit: 'readonly',
        Event: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        BroadcastChannel: 'readonly',
        addEventListener: 'readonly',
        dispatchEvent: 'readonly',
        // Test globals
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
      },
    },
  },

  // 3) JS files: don't use TS plugin; keep core rule with underscore escape
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
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
      '@typescript-eslint/no-unused-vars': 'off', // Use base ESLint rule instead
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // 5) Svelte recommended (flat)
  ...svelte.configs['flat/recommended'],

  // 5.5) Svelte files - fix unused vars
  {
    files: ['**/*.svelte'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

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

  // 7) Config files - disable TypeScript project service
  {
    files: ['**/vite.config.ts', '**/playwright.config.ts', '**/vitest*.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { 
        projectService: false,  // disable project service for config files
        tsconfigRootDir 
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // config files often need any
      '@typescript-eslint/no-unused-vars': 'off', // Use base ESLint rule instead
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // 7.5) Test spec files - disable TypeScript project service
  {
    files: ['tests/**/*.spec.ts', 'tests/**/*.test.ts', 'tests/setup-global.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { 
        projectService: false,  // disable project service for test files
        tsconfigRootDir 
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // test files often need any
      '@typescript-eslint/no-unused-vars': 'off', // Use base ESLint rule instead
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // 8) Prettier last to disable conflicting stylistic rules
  eslintConfigPrettier,
];