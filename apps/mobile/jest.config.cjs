// Jest runs the React Compiler check in perf/, and Reassure's measurements
// with `pnpm perf` from the repo root (see perf/README.md). Unit tests
// elsewhere run on node:test.
module.exports = {
  preset: "jest-expo/ios",
  testMatch: ["<rootDir>/perf/**/*.perf.{ts,tsx}"],
  // Reassure renders each scenario eleven times.
  testTimeout: 60_000,
  setupFiles: ["<rootDir>/perf/setup.ts"],
  // Worklets' own resolver, which swaps its native module for a JS one.
  resolver: "react-native-worklets/jest/resolver",
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    // `expo` opens a dev-server websocket when it loads in development, and
    // throws when the bundle didn't come from a server, as in Jest. pnpm
    // installs `expo` once per peer set (the app's and the audio package's),
    // so a `jest.mock` path reaches only one of them; this reaches both (it
    // matches the relative request, as `expo` writes it).
    "^\\./(async-require/)?messageSocket$": "<rootDir>/perf/empty-module.ts",
  },
  // The React Compiler runs as it does in the app (Metro turns it on with
  // `experiments.reactCompiler`), so render counts are the app's.
  transform: {
    "\\.[jt]sx?$": [
      "babel-jest",
      {
        caller: { name: "metro", bundler: "metro", platform: "ios" },
        plugins: [["babel-plugin-react-compiler", {}]],
        presets: ["babel-preset-expo"],
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native|expo|@expo|react-navigation|@react-navigation|@synq|@legendapp|uniwind|@tanstack))",
  ],
};
