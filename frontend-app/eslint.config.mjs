// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals"
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import next from "@next/eslint-plugin-next";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, globals: { ...globals.node, ...globals.browser }, },
    plugins: { "@typescript-eslint": ts },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },

  // ✅ Next.js plugin (flat config). This both "adds the plugin"
  // and applies Next's recommended rules so detection passes.
  {
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      // If you want Core Web Vitals instead, swap to:
      // ...next.configs["core-web-vitals"].rules,
    },
  },
  // your custom rules / ignores here
];
