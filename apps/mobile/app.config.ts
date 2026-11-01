import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * `APP_VARIANT=development` builds "SYNQ Dev": its own bundle ID, name,
 * scheme, and icon, so it installs next to the App Store app. Every
 * development binary uses it: the simulator and phone dev clients
 * (scripts/sim.sh, scripts/phone.sh). Only store builds are SYNQ. See
 * apps/mobile/README.md.
 */
const dev = process.env.APP_VARIANT === "development";

const EAS_PROJECT_ID = "df86bb9d-1587-48b7-a40e-85a09eee2a72";

/**
 * The iOS runtime version: an over-the-air update reaches only the
 * binaries built with the same one. Raise it only when this JavaScript
 * needs native code its older binaries don't have (a new native module,
 * prop, event, dependency, config plugin, or permission string). Native
 * changes the JavaScript doesn't depend on keep it, so older binaries keep
 * every update and the change ships in the next store build. 3.0 starts at
 * `ios-1`; raise it to `ios-2` and so on.
 */
const RUNTIME_VERSION = "ios-1";

/**
 * The 2.5.2 app icons, registered as iOS alternate icons under the names
 * 2.5.2 gave them. iOS remembers someone's choice by name, so these names
 * must never change. `icon-blue` is also SYNQ's primary icon; SYNQ Dev's
 * is `synq-dev` (assets/icons/README.md).
 */
const ALTERNATE_ICONS = [
  "icon-blue",
  "icon-mint",
  "icon-red",
  "icon-yellow",
  "icon-purple",
  "icon-orange",
  "icon-pink",
].map((name) => `./assets/icons/${name}.png`);

/** The app's background, behind the splash and every screen. */
const BACKGROUND = "#141414";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: dev ? "SYNQ Dev" : "SYNQ",
  slug: "synq",
  owner: "directedbyshawn",
  scheme: dev ? "synq-dev" : "synq",
  version: "3.0.0",
  orientation: "portrait",
  icon: dev ? "./assets/icons/synq-dev.png" : "./assets/icons/icon-blue.png",
  // SYNQ is always dark.
  userInterfaceStyle: "dark",
  backgroundColor: BACKGROUND,
  platforms: ["ios"],
  // Over-the-air updates (EAS Update) reach only binaries with the same
  // runtime version. Each build profile has its own channel (eas.json).
  updates: {
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },
  ios: {
    bundleIdentifier: dev
      ? "com.directedbyshawn.synq.dev"
      : "com.directedbyshawn.synq",
    runtimeVersion: RUNTIME_VERSION,
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      // Playback continues in the background and on the lock screen.
      UIBackgroundModes: ["audio"],
      // 2.5.2 showed its Documents folder in the Files app; keep it there.
      UIFileSharingEnabled: true,
      LSSupportsOpeningDocumentsInPlace: true,
      // Wi-Fi Transfer runs a web server on the local network while it's open.
      NSLocalNetworkUsageDescription:
        "SYNQ receives music from your computer over Wi-Fi while Wi-Fi Transfer is open.",
    },
  },
  plugins: [
    // Adopts the UIScene life cycle the iOS 27 SDK requires; remove with SDK 58.
    "./plugins/with-ios-scene-lifecycle.cjs",
    ["./plugins/with-alternate-icons.cjs", { icons: ALTERNATE_ICONS }],
    "expo-router",
    // Playback in the background and on the lock screen (packages/audio).
    "@synq/audio",
    [
      "expo-splash-screen",
      {
        // No logo: the app starts fast enough that one only flickers. The
        // color matches the app background, which fades in over it.
        backgroundColor: BACKGROUND,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: { projectId: EAS_PROJECT_ID },
  },
});
