import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";

const commonRules = {
  "no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
  "no-multi-spaces": "error",
  "space-infix-ops": "error",
  "space-before-blocks": "error",
  "keyword-spacing": ["error", { before: true, after: true }],
  "object-curly-spacing": ["error", "always"],
  "array-bracket-spacing": ["error", "never"],
  "comma-spacing": ["error", { before: false, after: true }],
};

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    extends: [js.configs.recommended],
    rules: commonRules,
  },

  // JS
  {
    files: ["frontend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    extends: [js.configs.recommended],
    rules: commonRules,
  },

  // JSX
  {
    files: ["frontend/**/*.{jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      react,
      reactHooks,
      reactRefresh,
    },
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"], // React import 강제 안 함
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      ...commonRules,
      "react/prop-types": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
]);
