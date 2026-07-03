const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: [".expo/**", "dist/**"],
  },
  expoConfig,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create']",
          message:
            "Use NativeWind/utility classes in the new app instead of StyleSheet.create.",
        },
      ],
    },
  },
]);
