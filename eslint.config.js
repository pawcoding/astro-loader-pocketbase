import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";

const config = tseslint.config({
  files: ["**/*.{js,mjs,cjs,ts}"],
  languageOptions: {
    globals: { ...globals.browser, ...globals.node }
  },
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic
  ],
  plugins: {
    "@stylistic": stylistic
  },
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ],
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "generic"
      }
    ],
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit"
      }
    ],
    "@typescript-eslint/no-empty-function": "off",
    // ESLint rules
    "comma-dangle": "error",
    "no-debugger": "off",
    semi: "error",
    "no-case-declarations": "off",
    // Stylistic rules
    "@stylistic/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true
        },
        singleline: {
          delimiter: "semi",
          requireLast: false
        }
      }
    ]
  }
});

export default config;
