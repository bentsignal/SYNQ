import * as Audio from "@synq/audio";

import { AD_AFTER_LISTENING_MS, adTrack } from "./ad";
import { native } from "./native-queue";
import { restoredListening } from "./persistence";
import { getPremiumTier } from "./premium-gate";

let generation = 0;
let countRestored = false;
let thresholdMs = AD_AFTER_LISTENING_MS;

/**
 * Free: the bundled ad plays at the first transition after 10 minutes of
 * listening (native counts it). Premium: no ad, and one already playing
 * stops. Called at launch and whenever the tier changes.
 */
export function configureAd() {
  generation += 1;
  const configuring = generation;
  if (getPremiumTier() === "premium") {
    native(Audio.configureInterstitial(null));
    return;
  }
  void adTrack()
    .then((track) => {
      if (configuring !== generation) return;
      // The stored count applies once; after that native keeps its own.
      const listenedMs = countRestored ? undefined : restoredListening();
      countRestored = true;
      return Audio.configureInterstitial({
        afterListeningMs: thresholdMs,
        listenedMs,
        track,
      });
    })
    .catch(() => undefined);
}

/** Development builds: hear the ad sooner (`synqDev.player.adAfter(ms)`). */
export function setAdThresholdForDevelopment(ms: number) {
  thresholdMs = ms;
  configureAd();
}
