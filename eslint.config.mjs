import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      "no-useless-constructor": "off",
      indent: ["warn", 2],
      "lines-between-class-members": "off",
      "comma-dangle": "off",
      "@typescript-eslint/camelcase": "off",
    },
    ignores: ["/lib/", "node_modules/", "dist/"],
  },
];
