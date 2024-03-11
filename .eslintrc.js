const config = require('eslint-config-standard-typescript-prettier');

module.exports = {
  ...config,
  parserOptions: { project: './tsconfig.json' },
  ignorePatterns: ['**/.husky', '**/.github'],
  rules: {
    ...config.rules,
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
