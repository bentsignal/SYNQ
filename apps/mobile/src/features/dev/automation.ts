import type { Href } from "expo-router";
import { DevSettings } from "react-native";
import { router } from "expo-router";

import { env } from "~/env";
import { frameReport, startFrames, stopFrames } from "./frames";
import { importSample } from "./import-sample";
import { playerAutomation } from "./player-automation";
import { seed } from "./seed";

function isAppPath(path: string): path is Href & string {
  return path.startsWith("/");
}

/**
 * Development builds only: lets `scripts/sim.sh open` move around the app
 * over Metro's debugger connection (scripts/sim-eval.mjs). iOS asks "Open
 * in SYNQ Dev?" before every `simctl openurl`, which scripts cannot answer.
 */
export function installDevAutomation() {
  if (!__DEV__ && !env.profileBundle) return;
  Object.assign(globalThis, {
    synqDev: {
      open(path: string) {
        if (!path.startsWith("/")) throw new Error(`Not an app path: ${path}`);
        if (isAppPath(path)) router.push(path);
      },
      reload() {
        DevSettings.reload();
      },
      /** `scripts/sim.sh seed`: the dev sample library (see seed.ts). */
      seed,
      /** `scripts/sim.sh frames start` and `stop`: see frames.ts. */
      frames: { report: frameReport, start: startFrames, stop: stopFrames },
      /** A large import without the Files picker: see import-sample.ts. */
      importSample,
      /** Playback: see player-automation.ts. */
      player: playerAutomation,
    },
  });
}
