import type { Track } from "@synq/audio";
import type { ArtworkRef, ArtworkSize, SongListItem } from "@synq/db";
import { artworkPath } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import type { QueueEntry } from "./queue-model";

/** How a song's artists read in the player, the lock screen, and rows. */
export function artistLine(song: Pick<SongListItem, "artists">) {
  return song.artists.length === 0
    ? "Unknown Artist"
    : song.artists.map((artist) => artist.name).join(", ");
}

/** Artwork files by version: a 2.5.2 cover may exist in one size only. */
const artworkFiles = new Map<string, string | undefined>();

/**
 * A cover's file URL, preferring `size` and falling back to the other; for
 * native (the lock screen, SwiftUI rows), which reads files directly.
 */
export function artworkFileUri(
  artwork: ArtworkRef | null,
  size: ArtworkSize = "full",
) {
  if (artwork === null) return undefined;
  const cacheKey = `${artwork.kind}/${artwork.id}/${artwork.version}/${size}`;
  if (artworkFiles.has(cacheKey)) return artworkFiles.get(cacheKey);
  const sizes =
    size === "full"
      ? (["full", "small"] as const)
      : (["small", "full"] as const);
  const file = sizes
    .map((candidate) => documentFile(artworkPath(artwork, candidate)))
    .find((candidate) => candidate.exists);
  artworkFiles.set(cacheKey, file?.uri);
  return file?.uri;
}

/**
 * The native track for a queue entry: its key is the track id, and the file
 * URL is built from path segments (`documentFile`), never concatenated, so
 * 2.5.2 file names with `#` or `%` resolve.
 */
export function trackFor(entry: QueueEntry, song: SongListItem) {
  return {
    album: song.albums[0]?.name,
    artist: artistLine(song),
    artworkUrl: artworkFileUri(song.artwork),
    durationMs: song.durationMs > 0 ? song.durationMs : undefined,
    id: entry.key,
    title: song.title,
    // A song without a file still gets a URL: native reports it missing
    // and moves past it, like any other file that went away.
    url: documentFile(song.filePath ?? `library/${song.id}/missing`).uri,
  } satisfies Track;
}

/** Whether native needs the queue again because what it shows changed. */
export function sameTrack(a: Track, b: Track) {
  return (
    a.id === b.id &&
    a.url === b.url &&
    a.title === b.title &&
    a.artist === b.artist &&
    a.album === b.album &&
    a.artworkUrl === b.artworkUrl &&
    a.durationMs === b.durationMs
  );
}
