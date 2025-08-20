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
        svelteStrictMode: false
        // NOTE: svelteBracketNewLine is deprecated in v3.
        // If you want the closing bracket on the next line,
        // use the core option instead:
        // bracketSameLine: false
      }
    }
  ]
};