import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname + "/../..",
        project: ["./tsconfig.base.json"]
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly"
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'svelte': sveltePlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    ignores: [
      "**/dist/",
      "**/.svelte-kit/",
      "node_modules/",
      "**/dist-tests/",
      ".pnpm-store/",
      ".husky/_/*"
    ]
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: {
          ts: tsParser
        },
        extraFileExtensions: [".svelte"],
        project: ["./tsconfig.base.json"]
      }
    },
    plugins: {
      'svelte': sveltePlugin
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      "svelte/no-at-html-tags": "warn"
    }
  },
  prettierConfig
];