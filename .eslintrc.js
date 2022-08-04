module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    node: true
  },
  globals: {
    context: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    before: 'readonly',
    after: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly'
  },
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'ES6',
    project: ['./tsconfigbase.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': true }],
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/triple-slash-reference': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    camelcase: 'warn',
    'no-inner-declarations': 'off',
    'no-prototype-builtins': 'off',
    'no-control-regex': 'warn',
    'no-undef': 'off',
    'no-case-declarations': 'warn',
    'no-useless-escape': 'off',
    'prefer-const': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false
      }
    ]
  }
};
