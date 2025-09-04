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
      // Test files environment
      files: ['tests/**/*.{ts,js,mjs}'],
      env: {
        node: true,
        es2022: true
      },
      globals: {
        Blob: 'readonly',
        crypto: 'readonly',
        CustomEvent: 'readonly'
      }
    }
  ]
};
