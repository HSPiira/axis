import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        module: true,
        require: true,
        exports: true,
        process: true,
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-undef": "warn",
      "no-prototype-builtins": "off",
      "no-unused-private-class-members": "warn",
      "no-redeclare": "warn",
      "no-empty": "warn",
      "@typescript-eslint/no-this-alias": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
