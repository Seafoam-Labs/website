// @ts-check

import { includeIgnoreFile } from "@eslint/compat";
import astro from "eslint-plugin-astro";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { resolve } from "node:path";

// See https://github.com/ota-meshi/eslint-plugin-astro/issues/447#issuecomment-3590892767
export default defineConfig(
  includeIgnoreFile(resolve(import.meta.dirname, ".gitignore")),
  // Support virtual files from <script> tags in Astro components.
  globalIgnores(["!.astro/**/*.ts"]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // Required to enable type-checked rules.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  astro.configs["jsx-a11y-recommended"],
  // `client-side-ts` extracts <script> tags from Astro components.
  {
    files: ["**/*.astro"],
    processor: astro.processors["client-side-ts"],
  },
  // Disable type-checked rules in Astro components. Due to issue 447.
  {
    files: ["**/*.astro", "**/*.astro/*.ts"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
);
