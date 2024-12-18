import Local from "./local/index.mjs";
import tseslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        globalThis: false,
        console: false,
      },
    },
    plugins: {
      local: {
        rules: Local,
      },
    },
    files: ["**/*.mjs"],
    rules: {
      // problems //
      "no-const-assign": "error",
      "no-debugger": "warn",
      "no-dupe-args": "error",
      "no-dupe-else-if": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-duplicate-imports": "error",
      "no-ex-assign": "error",
      "no-fallthrough": "error",
      "no-import-assign": "error",
      "no-unreachable": "error",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: false,
        },
      ],
      "no-use-before-define": "error",
      // suggestions //
      "arrow-body-style": ["error", "as-needed"],
      "default-case": "error",
      "default-case-last": "error",
      "default-param-last": "error",
      "dot-notation": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "logical-assignment-operators": ["error", "never"],
      "no-bitwise": "error",
      "no-console": "warn",
      "no-empty": "error",
      "no-eval": "error",
      "no-lone-blocks": "error",
      // "no-param-reassign": "error",
      // "no-plusplus": "error",
      "no-warning-comments": ["warn", { terms: ["todo"] }],
      "object-shorthand": ["error"],
      "prefer-const": ["error", { destructuring: "all" }],
      "require-await": "error",
      "require-yield": "error",
      // local //
      "local/curly": "error",
      "local/no-global": ["error", "globalThis", "console"],
      "local/no-method-call": "error",
    },
  },
  {
    files: ["lib/**/*.d.ts"],
    plugins: {
      "@typescript-eslint": /** @type {any} */ (tseslint.plugin),
    },
    languageOptions: {
      parser: /** @type {any} */ (tseslint.parser),
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "separate-type-imports",
        },
      ],
    },
  },
];
