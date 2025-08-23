/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always',
      ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'never', []],
    'header-max-length': [2, 'always', 72]
  }
};