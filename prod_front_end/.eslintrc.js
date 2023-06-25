module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: '18'
    }
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    'eslint-config-prettier'
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [__dirname + '/tsconfig.json']
  },
  plugins: ['react'],
  ignorePatterns: ['**/node_modules/*', '.eslintrc.js', '*.config.ts'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'multiline-ternary': 'off',
    'react/prop-types': 'off',
    'member-delimiter-style': 'off',
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/promise-function-async': 'off'
  }
}
