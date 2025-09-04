module.exports = {
  extends: [
    '@eslint/js',
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js',
    'tests/.artifacts/'
  ],
  overrides: [
    {
      // Browser environment for web app files
      files: ['apps/web/**/*.{ts,js,svelte}'],
      env: {
        browser: true,
        node: false,
        es2022: true
      }
    },
    {
      // Node environment for config files
      files: ['**/*.config.{ts,js}', '**/vite.config.ts', '**/vitest.config.ts'],
      env: {
        node: true
      }
    },
    {
      // Mixed environment for database layer (uses crypto)
      files: ['packages/db/**/*.ts'],
      env: {
        node: true,
        browser: true,
        es2022: true
      },
      globals: {
        crypto: 'readonly'
      }
    },
    {
      // Browser environment for logger (uses document, window)
      files: ['packages/logger/**/*.ts'],
      env: {
        node: true,
        browser: true,
        es2022: true
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    {
      // Browser environment for sim (uses performance, requestAnimationFrame, etc.)
      files: ['packages/sim/**/*.ts'],
      env: {
        node: true,
        browser: true,
        es2022: true
      },
      globals: {
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    {
      // Test files environment
      files: ['tests/**/*.{ts,js,mjs}'],
      env: {
        node: true,
        browser: true,
        es2022: true
      },
      globals: {
        Blob: 'readonly',
        crypto: 'readonly',
        CustomEvent: 'readonly',
        performance: 'readonly',
        window: 'readonly',
        document: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Event: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    }
  ]
};
