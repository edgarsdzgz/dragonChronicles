#!/usr/bin/env node

/**
 * @file Commit message validation helper
 * @description Quick validation tool for commit messages before committing
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Validates a commit message against project rules
 * @param {string} message - The commit message to validate
 * @returns {object} Validation result with errors and suggestions
 */
function validateCommitMessage(message) {
  const errors = [];
  const suggestions = [];
  
  // Check if message is empty
  if (!message || message.trim().length === 0) {
    errors.push('Commit message cannot be empty');
    return { valid: false, errors, suggestions };
  }
  
  const lines = message.split('\n');
  const header = lines[0];
  
  // Check header length
  if (header.length > 72) {
    errors.push(`Header too long: ${header.length} characters (max 72)`);
    suggestions.push(`Consider moving details to body or shortening description`);
  }
  
  // Check format: type(scope): description
  const formatRegex = /^(\w+)\(([^)]+)\):\s*(.+)$/;
  const match = header.match(formatRegex);
  
  if (!match) {
    errors.push('Invalid format. Expected: type(scope): description');
    suggestions.push('Example: feat(p1-e2-s1): implement enemy spawning system');
    return { valid: false, errors, suggestions };
  }
  
  const [, type, scope, description] = match;
  
  // Check type
  const allowedTypes = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'revert'];
  if (!allowedTypes.includes(type)) {
    errors.push(`Invalid type: ${type}`);
    suggestions.push(`Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check scope
  if (!scope || scope.trim().length === 0) {
    errors.push('Scope is required');
    suggestions.push('Common scopes: p1-e2-s1, engine, sim, web, docs, ci, build, deps');
  }
  
  // Check description
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
    suggestions.push('Be specific and actionable in your description');
  }
  
  // Check for common scope patterns
  const commonScopes = ['p1-e2-s1', 'p1-e2', 'engine', 'sim', 'web', 'docs', 'ci', 'build', 'deps'];
  if (scope && !commonScopes.includes(scope)) {
    suggestions.push(`Uncommon scope: ${scope}. Common scopes: ${commonScopes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    suggestions,
    parsed: { type, scope, description }
  };
}

/**
 * Main function to run validation
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node validate-commit-msg.mjs "commit message"');
    console.log('Example: node validate-commit-msg.mjs "feat(p1-e2-s1): implement enemy spawning system"');
    process.exit(1);
  }
  
  const message = args.join(' ');
  const result = validateCommitMessage(message);
  
  if (result.valid) {
    console.log('✅ Commit message is valid!');
    if (result.parsed) {
      console.log(`Type: ${result.parsed.type}`);
      console.log(`Scope: ${result.parsed.scope}`);
      console.log(`Description: ${result.parsed.description}`);
    }
  } else {
    console.log('❌ Commit message has errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
    
    if (result.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }
    
    console.log('\n📖 See docs/engineering/commit-rules-and-formatting.md for complete rules');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateCommitMessage };
