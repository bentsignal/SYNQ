import type * as Automation from "./automation";
import type * as QueueDrag from "./queue-drag-driver";

/**
 * The scripts' hooks, in development bundles and in the production bundle
 * `SYNQ_METRO_PROFILE=1 scripts/sim.sh up` serves for measuring
 * performance; null in a store bundle. The test is written out here rather
 * than kept in a shared constant: only then is it a constant when Metro
 * builds this file, so a store bundle leaves these modules, and everything
 * only they import, out.
 */
const included = __DEV__ || process.env.EXPO_PUBLIC_PROFILE_BUNDLE === "1";

/** `globalThis.synqDev` (`automation.ts`). */
export const devAutomation = included
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement would put it in store bundles.
    (require("./automation") as typeof Automation)
  : null;

/** The queue's scripted drag (`queue-drag-driver.tsx`). */
export const devQueueDrag = included
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement would put it in store bundles.
    (require("./queue-drag-driver") as typeof QueueDrag)
  : null;
