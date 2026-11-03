import { defineConfig } from "eslint/config";

import { baseConfig, strictConfig } from "@synq/eslint-config/base";
import { createStrictSyntax } from "@synq/eslint-config/syntax";

export default defineConfig(
  { ignores: ["src/migrations/**", "drizzle/**"] },
  baseConfig,
  strictConfig,
  createStrictSyntax({ ts: true, react: false }),
);
