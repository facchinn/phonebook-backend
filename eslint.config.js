import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: 'error',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
]
