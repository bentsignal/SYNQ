const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const noStyleSheet = require("./eslint-rules/no-stylesheet");

const synqNativewindPlugin = {
  rules: {
    "no-stylesheet": noStyleSheet,
  },
};

module.exports = defineConfig([
  {
    ignores: [".expo/**", "dist/**"],
  },
  expoConfig,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "synq-nativewind": synqNativewindPlugin,
    },
    rules: {
      "synq-nativewind/no-stylesheet": "error",
    },
  },
]);
