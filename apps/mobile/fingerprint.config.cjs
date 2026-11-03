// Native fingerprint: a hash of everything native, which changes whenever
// a binary would build differently. Dev clients are cached by it
// (scripts/sim.sh, scripts/phone.sh), and CI labels PRs that change it
// (.github/workflows/mobile-fingerprint.yml). Over-the-air updates match on
// the runtime version in app.config.ts instead. eas.json only affects
// native builds through env such as APP_VARIANT, which already reaches the
// hashed app config, so it is left out.
/** @type {import('expo/fingerprint').Config} */
const config = {
  ignorePaths: ["eas.json"],
  // The default skip, plus the runtime version itself: raising it changes
  // which updates binaries take, not how they build.
  sourceSkips: [
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
    "ExpoConfigRuntimeVersionIfString",
  ],
  extraSources: [
    // pnpm's patches to dependencies are in the repo's root, not this
    // project's `patches`, which is all the default sources read. A patch
    // to native code (react-native-screens' search tab) needs a new build.
    {
      type: "dir",
      filePath: "../../patches",
      reasons: ["pnpmPatches"],
    },
    // Reanimated compiles its static feature flags in from package.json's
    // "reanimated" key, which the default sources don't read.
    {
      type: "contents",
      id: "reanimatedStaticFeatureFlags",
      contents: JSON.stringify(require("./package.json").reanimated ?? null),
      reasons: ["reanimatedStaticFeatureFlags"],
    },
  ],
};
module.exports = config;
