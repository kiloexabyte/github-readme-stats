import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/*.d.ts"],
  },
  ...compat.extends("prettier"),
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },

      ecmaVersion: 2022,
      sourceType: "module",
      parser: tsParser,
    },
    plugins: {
      jsdoc,
    },
    rules: {
      "no-unexpected-multiline": "error",
      "accessor-pairs": [
        "error",
        {
          getWithoutSet: false,
          setWithoutGet: true,
        },
      ],
      "block-scoped-var": "warn",
      "consistent-return": "error",
      curly: "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-warning-comments": [
        "warn",
        {
          terms: ["TODO", "FIXME"],
          location: "start",
        },
      ],
      "no-with": "warn",
      radix: "warn",
      "no-delete-var": "error",
      "no-undef-init": "off",
      "no-undef": "error",
      "no-undefined": "off",
      "no-unused-vars": "off",
      "no-use-before-define": "error",
      "constructor-super": "error",
      "no-class-assign": "error",
      "no-const-assign": "error",
      "no-dupe-class-members": "error",
      "no-this-before-super": "error",
      "object-shorthand": ["warn"],
      "no-mixed-spaces-and-tabs": "warn",
      "no-multiple-empty-lines": "warn",
      "no-negated-condition": "warn",
      "no-unneeded-ternary": "warn",
      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-jsdoc": "off",
    },
  },
];
