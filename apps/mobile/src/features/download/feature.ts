import { requireOptionalNativeModule } from "expo";

import type * as Screens from "./screens";

/**
 * The Download feature, or null on a binary built before its native modules.
 * Importing them there would crash at launch, so they load only after this check.
 */
const hasNativeModules = ["ExpoClipboard", "ExpoSecureStore"].every(
  (name) => requireOptionalNativeModule(name) !== null,
);

export const downloadFeature = hasNativeModules
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement would run on every binary.
    (require("./screens") as typeof Screens)
  : null;
