import type { ComponentType } from "react";
import { requireOptionalNativeModule } from "expo";
import { Redirect } from "expo-router";

import type * as Screens from "./screens";

/**
 * The Download feature, or null in a build without it (docs/download-servers.md).
 * The literal `process.env` check is the point: Metro folds it at build time and
 * leaves this code out of a store bundle altogether. Don't read this flag through
 * a variable, or the code ships dormant, which App Review guideline 2.5.19 forbids.
 * A binary built before the Keychain module doesn't get it either: importing the
 * module there would crash at launch.
 */
export const downloadFeature =
  process.env.EXPO_PUBLIC_DOWNLOADS === "1"
    ? requireOptionalNativeModule("ExpoSecureStore") === null
      ? null
      : // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement can't be left out of the bundle.
        (require("./screens") as typeof Screens)
    : null;

function GoHome() {
  return <Redirect href="/" />;
}

/** A route file's screen; a build without the feature goes home. */
export function downloadRoute(pick: (feature: typeof Screens) => ComponentType) {
  return downloadFeature === null ? GoHome : pick(downloadFeature);
}
