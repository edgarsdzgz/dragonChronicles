import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default tseslint.config(
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'tests/.artifacts/**',
      '.svelte-kit/**',
      '.cache/**',
    ],
  },

  // Base TypeScript config
  {
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Browser environment for web app files
  {
    files: ['apps/web/**/*.{ts,tsx,js,svelte}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Node environment for config files
  {
    files: ['**/*.config.{ts,js}', '**/vite.config.ts', '**/vitest.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Mixed environment for database layer
  {
    files: ['packages/db/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Browser environment for logger
  {
    files: ['packages/logger/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Browser environment for sim
  {
    files: ['packages/sim/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Test files environment
  {
    files: ['tests/**/*.{ts,js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Svelte files
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    plugins: {
      svelte,
    },
    rules: {
      ...svelte.configs.recommended.rules,
    },
  },
);

