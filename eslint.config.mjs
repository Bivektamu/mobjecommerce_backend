import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".husky/**", "public/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // Existing resolvers use `any` today. The resolver typing slice removes it.
      "@typescript-eslint/no-explicit-any": "off",
      // Unused imports and locals are removed in the dead code removal slice.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
