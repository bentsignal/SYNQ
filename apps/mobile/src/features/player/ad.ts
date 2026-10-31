import type { Track } from "@synq/audio";
import { Asset } from "expo-asset";

import adAudio from "../../../assets/audio/ad.mp3";

/** Free users hear the ad after this much listening (2.5.2's 10 minutes). */
export const AD_AFTER_LISTENING_MS = 600_000;

/** The interstitial's track id; never a queue entry key (those are `songId.n`). */
export const AD_TRACK_ID = "synq-ad";

let loading: Promise<Track> | undefined;

/**
 * 2.5.2's bundled ad as a native track. The asset is copied to a local
 * file first (in development it comes from Metro), since native plays only
 * `file://` URLs.
 */
export function adTrack() {
  loading ??= Asset.fromModule(adAudio)
    .downloadAsync()
    .then((asset): Track => {
      if (asset.localUri === null) throw new Error("The ad has no local file.");
      return {
        artist: "SYNQ",
        id: AD_TRACK_ID,
        title: "Premium Ad",
        url: asset.localUri,
      };
    })
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    });
  return loading;
}
