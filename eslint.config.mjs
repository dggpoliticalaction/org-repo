import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import pluginNext from "@next/eslint-plugin-next"
import jsxA11y from "eslint-plugin-jsx-a11y"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow console.warn and console.error until we set up something like sentry
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": ["warn"],
      "no-alert": ["warn"],
      "no-unused-vars": "off", // Turn off base rule as it can report incorrect errors
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error"],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "prefer-const": ["error"],
    },
  },
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      // Overrides from recommended
      "react/react-in-jsx-scope": "off", // not needed with new JSX transform
      "react/prop-types": "off",
      "react/display-name": "off",
      // Additions not in recommended
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "ignore" }],
      "react/no-danger": "warn",
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
  },
  jsxA11y.flatConfigs.recommended,
  pluginNext.flatConfig.recommended,
  pluginNext.flatConfig.coreWebVitals,
  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: pluginReactHooks.configs.recommended.rules,
  },
  // Add Node.js globals for config files (e.g. next-sitemap.config.cjs uses process.env and module.exports)
  {
    files: ["**/*.config.js", "**/*.config.cjs", "**/*.config.mjs"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**", "out/**", "**/next-env.d.ts", "src/migrations/**"],
  },
  // Prettier config must be last to disable conflicting rules
  eslintConfigPrettier,
]
