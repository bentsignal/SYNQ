import type { Track } from "@synq/audio";
import * as Audio from "@synq/audio";

import type { QueueEntry } from "./queue-model";
import type { PlayerSongs } from "./songs";
import { currentIndex } from "./queue-model";
import { cachedSongs } from "./songs";
import { getPlayerState } from "./store";
import { trackFor } from "./tracks";

/** What native was last given, by entry key, to tell when metadata changed. */
let pushed = new Map<string, Track>();

export function pushedTrack(key: string) {
  return pushed.get(key);
}

/** Native tracks for entries (whose songs are loaded), remembered as given. */
export function tracksFor(entries: readonly QueueEntry[], songs: PlayerSongs) {
  return entries.flatMap((entry) => {
    const song = songs.get(entry.songId);
    if (song === undefined) return [];
    const track = trackFor(entry, song);
    pushed.set(entry.key, track);
    return [track];
  });
}

/** A new queue replaces what native had. */
export function forgetPushedTracks() {
  pushed = new Map();
}

/**
 * Gives native the whole queue again, current entry kept (so it carries on
 * without a gap): after a native call failed, or when songs' titles or
 * covers changed.
 */
export function resyncNative() {
  pushed = new Map();
  const { queue } = getPlayerState();
  const tracks = tracksFor(queue.entries, cachedSongs());
  void Audio.setQueue(tracks, {
    startIndex: Math.max(0, currentIndex(queue)),
  }).catch(() => undefined);
}

/** Runs a native call; if it fails, native and JavaScript disagree, so resync. */
export function native(call: Promise<unknown>) {
  void call.catch(resyncNative);
}
