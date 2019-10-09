module.exports = {
  "parser": "babel-eslint",
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'standard', 'plugin:prettier/recommended', 'standard-jsx'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'prettier/prettier': 'error'
  },
}
