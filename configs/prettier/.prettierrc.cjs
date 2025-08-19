module.exports = {
  printWidth: 100,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  plugins: ['prettier-plugin-svelte'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
        // Svelte-specific options
        svelteAllowShorthand: true,
        svelteStrictMode: false,
        svelteBracketNewLine: true
      }
    }
  ]
};