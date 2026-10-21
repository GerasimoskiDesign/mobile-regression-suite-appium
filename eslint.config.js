import js from '@eslint/js';
import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', 'reports/**', 'apps/**', 'coverage/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    // WebdriverIO injects `driver` / `browser` into hooks defined in the config.
    files: ['config/**/*.js'],
    languageOptions: { globals: { driver: 'readonly', browser: 'readonly' } },
  },
  {
    files: ['test/specs/**/*.js'],
    plugins: { mocha },
    languageOptions: { globals: { ...globals.mocha } },
    rules: {
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-identical-title': 'error',
      'mocha/no-pending-tests': 'error',
      // Every test title starts with its TEST_MATRIX.md id, e.g. "CART-02 ...".
      'mocha/valid-test-title': [
        'error',
        {
          pattern: '^[A-Z]+-[0-9]{2} ',
          message: 'Test title must start with a matrix id like "CART-02 "',
        },
      ],
      'mocha/max-top-level-suites': ['error', { limit: 1 }],
    },
  },
  prettier,
];
