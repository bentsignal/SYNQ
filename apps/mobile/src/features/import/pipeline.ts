import { Directory, File, Paths } from "expo-file-system";

import type { RawTags } from "~/features/media/song-tags";
import { addSongs, deleteSongs, setArtwork } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import { libraryDb } from "~/features/library/database";
import { readFlacTags } from "~/features/media/flac";
import { readFlacBlocks } from "~/features/media/heads";
import { synqMedia } from "~/features/media/native";
import { queryClient } from "~/lib/query-client";
import { audioExtension, audioMimeType, cleanTags } from "./clean-tags";

/** Where imports stage their work; cleared when an import session ends. */
export const IMPORT_DIRECTORY = new Directory(Paths.cache, "import");

/** A file to import: picked in Files, or received over Wi-Fi. */
export interface ImportSource {
  /** Unique within the session. */
  key: string;
  /** The file's name as it will be stored. */
  name: string;
  /** A file in the app's cache, which the import moves into the library. */
  uri: string;
  mimeType: string | null;
}

/** A source read and ready to import. */
export interface ReadSong {
  title: string;
  /** The raw artist tag; the library splits it into artists. */
  artists: string | null;
  album: string | null;
  year: number | null;
  track: number | null;
  durationMs: number;
  mimeType: string | null;
  /** The covers rendered from the embedded artwork, in the staging folder. */
  covers: Directory | null;
}

function stagingFor(key: string) {
  return new Directory(IMPORT_DIRECTORY, "items", key);
}

/**
 * Reads a file's tags, duration, and artwork (rendering the covers into
 * its staging folder). Throws when the file isn't playable audio.
 */
export async function readSource(source: ImportSource) {
  const staging = stagingFor(source.key);
  staging.create({ idempotent: true, intermediates: true });
  const artwork = new File(staging, "artwork");
  const info = await synqMedia().readAudioFile(source.uri, artwork.uri);
  const raw: RawTags = {
    album: info.album ?? null,
    artist: info.artist ?? null,
    title: info.title ?? null,
    track: info.track ?? null,
    year: info.year ?? null,
  };
  let hasArtwork = info.hasArtwork;
  if (audioExtension(source.name) === "flac") {
    // AVFoundation doesn't read Vorbis comments.
    const flac = readFlacTags(readFlacBlocks(new File(source.uri)).blocks);
    raw.title ??= flac.tags.title;
    raw.artist ??= flac.tags.artist;
    raw.album ??= flac.tags.album;
    raw.year ??= flac.tags.year;
    raw.track ??= flac.tags.track;
    if (!hasArtwork && flac.artwork !== null) {
      artwork.write(flac.artwork);
      hasArtwork = true;
    }
  }
  let covers: Directory | null = null;
  if (hasArtwork) {
    const directory = new Directory(staging, "covers");
    // A broken embedded image just means no artwork.
    covers = await synqMedia()
      .writeCovers(artwork.uri, directory.uri)
      .then(() => directory)
      .catch(() => null);
  }
  return {
    ...cleanTags(source.name, raw),
    covers,
    durationMs: info.durationMs,
    mimeType: audioMimeType(source.name, source.mimeType),
  } satisfies ReadSong;
}

/** The small cover rendered for an item, for the import list. */
export function stagedCoverUri(read: ReadSong) {
  return read.covers === null
    ? null
    : new File(read.covers, "cover_small.jpg").uri;
}

async function moveInto(file: File, destination: File) {
  if (destination.exists) destination.delete();
  await file.move(destination);
}

/**
 * Adds a read song to the library: the row (finding or creating its
 * artists and album), then its audio and covers moved into its folders.
 * Library screens refresh only once the files are in place, so a new song
 * never shows without its artwork. If the audio can't be moved, the row is
 * removed again. Returns the song's id.
 */
export async function importSong(source: ImportSource, read: ReadSong) {
  const db = libraryDb();
  const [added] = addSongs(db, [
    {
      album: read.album,
      artists: read.artists,
      durationMs: read.durationMs,
      fileName: source.name,
      hasArtwork: read.covers !== null,
      mimeType: read.mimeType,
      title: read.title,
      track: read.track,
      year: read.year,
    },
  ]).value;
  if (added === undefined) throw new Error("The song wasn't added.");
  try {
    const audio = documentFile(added.filePath);
    audio.parentDirectory.create({ idempotent: true, intermediates: true });
    await moveInto(new File(source.uri), audio);
  } catch (error) {
    deleteSongs(db, [added.id]);
    const folder = new Directory(Paths.document, "library", String(added.id));
    if (folder.exists) folder.delete();
    throw error;
  }
  const target = added.artworkTarget;
  if (target !== null && read.covers !== null) {
    try {
      const folder = new Directory(Paths.document, ...target.dir.split("/"));
      folder.create({ idempotent: true, intermediates: true });
      for (const name of ["cover_full.jpg", "cover_small.jpg"]) {
        await moveInto(new File(read.covers, name), new File(folder, name));
      }
    } catch {
      // The song stays; it just has no artwork.
      setArtwork(db, target.kind, target.id, false);
    }
  }
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  return added.id;
}

/** Removes a source's staged files (its copy, artwork, and covers). */
export function discardSource(source: ImportSource) {
  for (const entry of [new File(source.uri), stagingFor(source.key)]) {
    try {
      if (entry.exists) entry.delete();
    } catch {
      // Staging lives in the cache, which iOS clears anyway.
    }
  }
}

/** Clears everything imports staged. */
export function clearImportStaging() {
  try {
    if (IMPORT_DIRECTORY.exists) IMPORT_DIRECTORY.delete();
  } catch {
    // As above: only cache.
  }
}
