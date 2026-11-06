import { defineConfig } from "eslint/config";

import { baseConfig, strictConfig } from "@synq/eslint-config/base";
import { reactConfig } from "@synq/eslint-config/react";
import { createStrictSyntax } from "@synq/eslint-config/syntax";

export default defineConfig(
  { ignores: [".next/**", "out/**", "next-env.d.ts"] },
  baseConfig,
  strictConfig,
  reactConfig,
  createStrictSyntax({ ts: true, react: true }),
);
