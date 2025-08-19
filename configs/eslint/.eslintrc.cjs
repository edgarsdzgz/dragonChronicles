/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: [
    "**/dist/",
    "**/.svelte-kit/",
    "node_modules/",
    "**/dist-tests/"
  ],
  env: { es2021: true, browser: false, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname + "/../../..",
    project: ["./tsconfig.base.json"]
  },
  plugins: ["@typescript-eslint", "svelte"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "prettier" // must be last to disable conflicting rules
  ],
  settings: {
    // Ensure Svelte plugin finds the right parser for <script lang="ts">
    "svelte3/typescript": true
  },
  overrides: [
    {
      files: ["**/*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: {
          ts: "@typescript-eslint/parser"
        },
        extraFileExtensions: [".svelte"],
        project: ["./tsconfig.base.json"]
      },
      rules: {
        // Keep template rules sane and low-noise
        "svelte/no-at-html-tags": "warn"
      }
    },
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.js"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
      }
    }
  ]
};