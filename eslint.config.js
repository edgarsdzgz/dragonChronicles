import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import prettier from "eslint-config-prettier";

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/dist-tests/",
      "**/.svelte-kit/",
      "**/.cache/",
      "**/coverage/",
      "**/LEGACY_v*/",
      "**/playwright-report/",
      "**/test-results/",
      "**/screens/",
      "**/.pnpm-store/",
      "**/.husky/_/*"
    ]
  },

  // Base JavaScript/TypeScript configuration
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        tsconfigRootDir: import.meta.dirname,
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
      "@typescript-eslint": tseslint
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },

  // Svelte-specific configuration
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: {
          ts: tsparser
        },
        extraFileExtensions: [".svelte"],
        project: ["./tsconfig.base.json"],
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      svelte,
      "@typescript-eslint": tseslint
    },
    rules: {
      ...svelte.configs.recommended.rules,
      "svelte/no-at-html-tags": "warn"
    }
  },

  // Prettier config (must be last to disable conflicting rules)
  prettier
];