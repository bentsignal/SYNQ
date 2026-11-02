import { Directory, File, Paths } from "expo-file-system";

import { addSongs, deleteSongs, setArtwork } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import type { NativeAudioInfo } from "~/features/media/native";
import type { RawTags } from "~/features/media/song-tags";
import { libraryDb } from "~/features/library/database";
import { withFileSource } from "~/features/media/file-source";
import { synqMedia } from "~/features/media/native";
import { readEmbeddedTags } from "~/features/media/retag";
import { audioMimeType, cleanTags } from "./clean-tags";

/** Where imports stage their work; cleared whenever the queue is idle. */
export const IMPORT_DIRECTORY = new Directory(Paths.cache, "import");

/** A file to import: picked in Files, or received over Wi-Fi. */
export interface ImportSource {
  /** Unique among the files being imported. */
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
  /** The raw album artist tag, split the same way. */
  albumArtists: string | null;
  compilation: boolean;
  year: number | null;
  track: number | null;
  durationMs: number;
  mimeType: string | null;
  /** The covers rendered from the embedded artwork, in the staging folder. */
  covers: Directory | null;
}

/**
 * This batch's albums that another same-named song without an album artist
 * can still join (docs/rewrite.md → Same-named albums). A batch ends when the
 * queue goes idle, which is when `clearImportStaging` runs.
 */
const openAlbums = new Set<number>();

function stagingFor(key: string) {
  return new Directory(IMPORT_DIRECTORY, "items", key);
}

function rawTags(info: NativeAudioInfo) {
  return {
    album: info.album ?? null,
    albumArtist: null,
    artist: info.artist ?? null,
    compilation: false,
    title: info.title ?? null,
    track: info.track ?? null,
    year: info.year ?? null,
  } satisfies RawTags;
}

/** A tag SYNQ can't parse is no reason to refuse a file that plays. */
function embeddedTagsOf(source: ImportSource) {
  try {
    return withFileSource(new File(source.uri), (bytes) =>
      readEmbeddedTags(bytes, source.name),
    );
  } catch {
    return null;
  }
}

/**
 * What SYNQ reads from the file itself wins over AVFoundation, which skips
 * FLAC, ID3v2.2, extended headers, album artists, and the compilation flag,
 * and takes the first picture rather than the front cover. Its cover is
 * written to `artwork`. AVFoundation still fills in the rest (ID3v1).
 */
function withEmbeddedTags(
  source: ImportSource,
  raw: RawTags,
  artwork: File,
  hasArtwork: boolean,
) {
  const embedded = embeddedTagsOf(source);
  if (embedded === null) return { hasArtwork, tags: raw };
  const tags = {
    album: embedded.tags.album ?? raw.album,
    albumArtist: embedded.tags.albumArtist,
    artist: embedded.tags.artist ?? raw.artist,
    compilation: embedded.tags.compilation,
    title: embedded.tags.title ?? raw.title,
    track: embedded.tags.track ?? raw.track,
    year: embedded.tags.year ?? raw.year,
  } satisfies RawTags;
  if (embedded.artwork === null) return { hasArtwork, tags };
  artwork.write(embedded.artwork);
  return { hasArtwork: true, tags };
}

/** Renders the covers from embedded artwork; null if the image is broken. */
function renderCovers(staging: Directory, artwork: File) {
  const directory = new Directory(staging, "covers");
  return synqMedia()
    .writeCovers(artwork.uri, directory.uri)
    .then(
      () => directory,
      () => null,
    );
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
  const read = withEmbeddedTags(
    source,
    rawTags(info),
    artwork,
    info.hasArtwork,
  );
  const covers = read.hasArtwork ? await renderCovers(staging, artwork) : null;
  return {
    ...cleanTags(source.name, read.tags),
    covers,
    durationMs: info.durationMs,
    mimeType: audioMimeType(source.name, source.mimeType),
  } satisfies ReadSong;
}

async function moveInto(file: File, destination: File) {
  if (destination.exists) destination.delete();
  await file.move(destination);
}

/**
 * Adds a read song to the library: the row (finding or creating its
 * artists and album), then its audio and covers moved into its folders.
 * The caller refreshes library screens afterwards, once the files are in
 * place, so a new song never shows without its artwork. If the audio can't
 * be moved, the row is removed again. Returns the song's id.
 */
export async function importSong(source: ImportSource, read: ReadSong) {
  const db = libraryDb();
  const [added] = addSongs(
    db,
    [
      {
        album: read.album,
        albumArtists: read.albumArtists,
        artists: read.artists,
        compilation: read.compilation,
        durationMs: read.durationMs,
        fileName: source.name,
        hasArtwork: read.covers !== null,
        mimeType: read.mimeType,
        title: read.title,
        track: read.track,
        year: read.year,
      },
    ],
    { openAlbums },
  ).value;
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
      const covers = read.covers;
      await Promise.all(
        ["cover_full.jpg", "cover_small.jpg"].map((name) =>
          moveInto(new File(covers, name), new File(folder, name)),
        ),
      );
    } catch {
      // The song stays; it just has no artwork.
      setArtwork(db, { id: target.id, kind: target.kind, present: false });
    }
  }
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

/** Clears everything imports staged. The next import starts a new batch. */
export function clearImportStaging() {
  openAlbums.clear();
  try {
    if (IMPORT_DIRECTORY.exists) IMPORT_DIRECTORY.delete();
  } catch {
    // As above: only cache.
  }
}
