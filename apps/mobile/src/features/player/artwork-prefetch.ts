import { AppState } from "react-native";
import { Paths } from "expo-file-system";
import { Image } from "expo-image";

import { artworkUri } from "@synq/db";

import type { PlayerSongs } from "./songs";
import { queryClient } from "~/lib/query-client";
import { prefetchArtworkAnalysis } from "./artwork-analysis";
import { neighbors } from "./queue-model";
import { PLAYER_SONGS_QUERY } from "./songs";
import { getPlayerState } from "./store";

/** Enough for a dozen 1500 px covers; the memory cache holds nothing else. */
const MEMORY_CACHE_BYTES = 110 * 1024 * 1024;

let cacheConfigured = false;
let lastUris = "";

function isPlayerSongs(value: unknown): value is PlayerSongs {
  return value instanceof Map;
}

/** The covers of the current song and the songs a skip would land on. */
function artworksAroundCurrent() {
  const { current, queue, repeat } = getPlayerState();
  const cached = queryClient.getQueryData(PLAYER_SONGS_QUERY);
  if (current === null || !isPlayerSongs(cached)) return [];
  return [current, ...neighbors(queue, repeat)]
    .map((entry) => cached.get(entry.songId)?.artwork)
    .filter((artwork) => artwork !== undefined && artwork !== null);
}

/**
 * Decodes the covers of the songs around the current one into memory, so a
 * skip finds them ready: `SeamlessArtwork` swaps within the frame, in the
 * player (full) and the mini player (small). The current song's stays warm
 * too, so opening the player is sharp from its first frame. Only while the app
 * is on screen: in the background nothing would draw them.
 */
export function prefetchAroundCurrent() {
  if (AppState.currentState !== "active") return;
  const artworks = artworksAroundCurrent();
  const uris = artworks.flatMap((artwork) => [
    artworkUri(Paths.document.uri, artwork, "full"),
    artworkUri(Paths.document.uri, artwork, "small"),
  ]);
  const key = uris.join();
  if (uris.length === 0 || key === lastUris) return;
  lastUris = key;

  if (!cacheConfigured) {
    cacheConfigured = true;
    Image.configureCache({ maxMemoryCost: MEMORY_CACHE_BYTES });
  }
  // A cover in only one size fails its other file, which nothing depends on.
  Image.prefetch(uris, "memory").catch(() => false);
  artworks.forEach(prefetchArtworkAnalysis);
}
