import { requireOptionalNativeModule } from "expo";

import type * as Screens from "./screens";

/**
 * The Download feature, or null on a binary built before its Keychain module.
 * Importing that module there would crash at launch, so it loads only after this
 * check.
 */
export const downloadFeature =
  requireOptionalNativeModule("ExpoSecureStore") === null
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement would run on every binary.
      (require("./screens") as typeof Screens);
