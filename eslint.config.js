import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["dist/**", ".eslintrc.cjs"],
  },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["e2e/**", "playwright.config.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // E2E tests configuration
  {
    files: ["e2e/**/*.ts", "playwright.config.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.e2e.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disable React-specific rules for e2e tests
      "react-refresh/only-export-components": "off",
      // Allow async functions without await (common in Playwright)
      "@typescript-eslint/require-await": "off",
      // Allow any type in test utilities
      "@typescript-eslint/no-explicit-any": "warn",
      // Playwright's expect is dynamically typed
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      // process.env is common in config files
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  }
);
