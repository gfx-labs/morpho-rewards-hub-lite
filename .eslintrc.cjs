const { join } = require("path");

module.exports = {
  // Root leverages the cascading feature of ESLint.
  // Children can still overrides settings.
  // https://eslint.org/docs/latest/user-guide/configuring/configuration-files#cascading-and-hierarchy
  root: true,

  // Common config shared accross all children projects.
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:prettier/recommended",
    "plugin:rxjs/recommended",
    "next/core-web-vitals",
  ],
  plugins: ["@typescript-eslint", "unused-imports", "custom"],
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: "module",
    project: join(__dirname, "./tsconfig.json"),
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "no-console": [
      "error",
      { allow: ["warn", "error", "info", "time", "timeEnd"] },
    ],
    "unused-imports/no-unused-imports": "error",
    "react-hooks/exhaustive-deps": [
      "error",
      {
        additionalHooks:
          "(useBNEffect|useBNCallback|useBNMemo|usePromisedMemo|useAffect|useClosable|useObservable|useSubscription|useMemoWithHistory)",
      },
    ],
    "@next/next/no-img-element": "off",
    "react/display-name": "off",
    "rxjs/suffix-subjects": [
      "error",
      { suffix: "Subject$", properties: false },
    ],
    "rxjs/no-unsafe-takeuntil": "off",
    "rxjs/no-sharereplay": "off",
    "rxjs/no-async-subscribe": "off",
    "custom/no-checksum-addresses": "error",
  },
  ignorePatterns: ["out", ".next", "dist", "cache", "lib", "storybook-*"],
};
