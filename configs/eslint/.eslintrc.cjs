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
    ecmaVersion: 2021,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier" // must be last to disable conflicting rules
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
};