import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Extend Next.js configs using FlatCompat
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Custom rules for pragmatic-papers, merging with Next.js specific TypeScript rules
  {
    rules: {
      // Allow console.warn and console.error until we set up something like sentry
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": ["warn"],
      "no-alert": ["warn"],
      "no-unused-vars": "off", // Turn off base rule as it can report incorrect errors
      "@typescript-eslint/no-unused-vars": [ // This rule might be brought in by next/typescript extension, but good to ensure
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "prefer-const": ["error"],
      "@typescript-eslint/no-unused-expressions": "off",
      // React rules - these are likely covered by next/core-web-vitals, but if not, can re-add manually or via plugin
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/jsx-key": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/no-danger": "warn",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-unknown-property": "error",
      "react/prefer-es6-class": "error",
      "react/prefer-stateless-function": "warn",
      "react/self-closing-comp": "error",
      "react/sort-comp": [
        "error",
        {
          order: ["static-methods", "lifecycle", "everything-else", "render"],
          groups: {
            lifecycle: [
              "displayName",
              "propTypes",
              "contextTypes",
              "childContextTypes",
              "mixins",
              "statics",
              "defaultProps",
              "constructor",
              "getDefaultProps",
              "state",
              "getInitialState",
              "getChildContext",
              "getDerivedStateFromProps",
              "componentWillMount",
              "UNSAFE_componentWillMount",
              "componentDidMount",
              "componentWillReceiveProps",
              "UNSAFE_componentWillReceiveProps",
              "shouldComponentUpdate",
              "componentWillUpdate",
              "UNSAFE_componentWillUpdate",
              "getSnapshotBeforeUpdate",
              "componentDidUpdate",
              "componentDidCatch",
              "componentWillUnmount",
            ],
          },
        },
      ],
    },
    // Settings for React when using FlatCompat might need to be specified explicitly
    settings: {
        react: {
            version: "detect"
        }
    }
  },
  // Rules for config files and redirects.js
  {
    files: [
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/redirects.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-shadow": "off",
      "no-constant-binary-expression": "off",
    },
  },
  // Ignore patterns
  {
    ignores: [
      ".next/",
      "dist/**",
      "node_modules/**",
      "out/**",
      "**/next-env.d.ts",
      "src/migrations/**",
    ],
  },
  eslintConfigPrettier, // Always last to override other configs
];

export default eslintConfig
