import js from '@eslint/js'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import eslintConfigPrettier from 'eslint-config-prettier'

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      // Allow console.warn and console.error until we set up something like sentry
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': ['warn'],
      'no-alert': ['warn'],
      'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error'],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      'prefer-const': ['error'],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.next/**', 'out/**', '**/next-env.d.ts'],
  },
  // Prettier config must be last to disable conflicting rules
  eslintConfigPrettier,
]
