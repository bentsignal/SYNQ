import { NO_COMPRESSION, zip } from "react-native-zip-archive";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { SongListItem } from "@synq/db";
import {
  artworkPath,
  getAlbum,
  getArtist,
  getArtistDetail,
  getPlaylist,
  getSong,
  listAlbumTracks,
  listPlaylistSongs,
  markSongsExported,
} from "@synq/db";
import { documentFile } from "@synq/db/expo";

import type { SongTags } from "~/features/media/song-tags";
import { track } from "~/features/analytics/analytics";
import { pathOf, withZipProgress } from "~/features/backup/backup";
import {
  getBookkeeping,
  updateBookkeeping,
} from "~/features/import/bookkeeping";
import { failed } from "~/features/library/actions";
import { libraryDb } from "~/features/library/database";
import { applyPatches, withFileSource } from "~/features/media/file-source";
import { synqMedia } from "~/features/media/native";
import {
  matchesExtension,
  planRetag,
  sniffAudio,
} from "~/features/media/retag";
import { queryClient } from "~/lib/query-client";
import {
  cleanName,
  splitExtension,
  titleFileName,
  trackFileName,
} from "./file-names";
import { beginExport } from "./progress";

/** The part of an export's progress that is copying; zipping is the rest. */
const COPY_SHARE = 0.5;

/**
 * Export (Share): copies of songs with the library's current tags (title,
 * artists, album, album artists, year, track, artwork) written in, in the
 * share sheet: one song as its file, an album, playlist, or artist as one zip.
 * Library files are never modified (an edit only changes the database), and
 * the copies go when the sheet closes. `planRetag` works out the tags for the
 * file's format (docs/audio-tags.md); a file it can't tag is shared as it is,
 * since the music matters more than the tags.
 */

const EXPORT_DIRECTORY = new Directory(Paths.cache, "export");

/** An export failure with something to tell the person. */
export class ExportError extends Error {}

/** A `.catch` that reports an export's failure with its reason, when it has one. */
export function exportFailed(title: string) {
  return (error: unknown) => {
    failed(title, error instanceof ExportError ? error.message : undefined);
  };
}

/** A name unused in `folder`: "Song.mp3", then "Song 2.mp3". */
function uniqueFile(folder: Directory, name: string) {
  const { stem, extension } = splitExtension(name);
  let candidate = new File(folder, name);
  for (let n = 2; candidate.exists; n++) {
    candidate = new File(folder, `${stem} ${String(n)}${extension}`);
  }
  return candidate;
}

/** What a song's tags take from its primary album. */
function albumTags(song: SongListItem) {
  const [album] = song.albums;
  const row = album === undefined ? null : getAlbum(libraryDb(), album.id);
  if (album === undefined || row === null) {
    return { album: null, albumArtists: [], track: null, year: null };
  }
  return {
    album: album.name,
    albumArtists: row.artists.map((artist) => artist.name),
    track: album.track,
    year: row.year,
  };
}

function tagsFor(song: SongListItem, cover: File | null) {
  return {
    ...albumTags(song),
    artists: song.artists.map((artist) => artist.name),
    artwork: cover === null ? null : cover.bytesSync(),
    title: song.title,
  } satisfies SongTags;
}

/** The song's audio in the library; throws when it has none. */
function songFile(song: SongListItem) {
  const file = song.filePath === null ? null : documentFile(song.filePath);
  if (!file?.exists) throw new Error("The song's file is missing.");
  return file;
}

/** The song's full-size cover, if it has one on disk. */
function coverFile(song: SongListItem) {
  if (song.artwork === null) return null;
  const file = documentFile(artworkPath(song.artwork, "full"));
  return file.exists ? file : null;
}

/** AVFoundation's passthrough remux, for the M4A files `planRetag` leaves out. */
async function writeMp4Natively(
  source: File,
  destination: File,
  tags: SongTags,
  cover: File | null,
) {
  await synqMedia().tagMp4(
    source.uri,
    destination.uri,
    {
      album: tags.album,
      artist: tags.artists.length > 0 ? tags.artists.join(", ") : null,
      title: tags.title === "" ? null : tags.title,
      track: tags.track,
      year: tags.year,
    },
    cover?.uri ?? null,
  );
  return true;
}

/**
 * Writes `tags` into `destination`, a copy of `source`, in the file's own
 * tag format. False when it has none SYNQ can write.
 */
async function writeTagged(
  source: File,
  destination: File,
  tags: SongTags,
  cover: File | null,
) {
  const { format, plan } = withFileSource(source, (bytes) => ({
    format: sniffAudio(bytes, source.name),
    plan: planRetag(bytes, source.name, tags),
  }));
  if (plan === null) {
    return format === "mp4" && matchesExtension(format, source.name)
      ? writeMp4Natively(source, destination, tags, cover)
      : false;
  }
  await synqMedia().spliceFile(
    source.uri,
    destination.uri,
    plan.skip,
    plan.head,
  );
  applyPatches(destination, plan.patches);
  return true;
}

/** Writes a tagged copy of `song` into `folder` as `name`; returns the copy. */
async function exportCopy(song: SongListItem, folder: Directory, name: string) {
  const source = songFile(song);
  const destination = uniqueFile(folder, name);
  const cover = coverFile(song);
  // Shared as it is when retagging fails: the music matters more than the tags.
  const tagged = await Promise.resolve()
    .then(() => writeTagged(source, destination, tagsFor(song, cover), cover))
    .catch(() => false);
  if (!tagged) {
    if (destination.exists) destination.delete();
    // Natively, off the JavaScript thread: a WAV can be hundreds of megabytes.
    await synqMedia().spliceFile(
      source.uri,
      destination.uri,
      0,
      new Uint8Array(0),
    );
  }
  return destination;
}

function songsById(ids: readonly number[]) {
  const db = libraryDb();
  return ids.flatMap((id) => getSong(db, id) ?? []);
}

function clearExportDirectory() {
  try {
    if (EXPORT_DIRECTORY.exists) EXPORT_DIRECTORY.delete();
  } catch {
    // Only cache, which iOS clears when it needs the space.
  }
}

/** A fresh folder inside the export directory, for this export's copies. */
function freshFolder() {
  clearExportDirectory();
  const folder = new Directory(EXPORT_DIRECTORY, "songs");
  folder.create({ idempotent: true, intermediates: true });
  return folder;
}

/**
 * An export writes the copies and then the zip, so it needs room for the
 * audio twice over until the copies are deleted.
 */
function requireRoomFor(songs: readonly SongListItem[]) {
  let bytes = 0;
  for (const song of songs) {
    const file = song.filePath === null ? null : documentFile(song.filePath);
    if (file?.exists) bytes += file.size;
  }
  if (Paths.availableDiskSpace < bytes * 2) {
    throw new ExportError("There isn't enough free space on this iPhone.");
  }
}

/** What the export's done with: their tags went out with the files. */
function recordExported(songIds: readonly number[]) {
  markSongsExported(libraryDb(), songIds);
  void queryClient.invalidateQueries({ queryKey: ["library"] });
}

/** Lets the screen update between songs, so a long export never holds it up. */
function nextTurn() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

type ExportJob = NonNullable<ReturnType<typeof beginExport>>;

/**
 * Runs one export with its progress, then deletes its temporary files,
 * however it ended. Only one runs at a time.
 */
async function exportJob(
  name: string,
  total: number,
  run: (job: ExportJob) => Promise<void>,
) {
  const job = beginExport(name, total);
  if (job === null) throw new ExportError("Another export is still running.");
  function finish() {
    job?.end();
    clearExportDirectory();
  }
  await run(job).then(finish, (error: unknown) => {
    finish();
    throw error;
  });
}

/**
 * Shares songs as one zip named `name`, in the order given. Copying is one
 * half of the progress and zipping the other: audio doesn't compress, so
 * both move every byte once. Resolves once the share sheet closes, or as
 * soon as it can after the person cancels; rejects when nothing could be
 * exported.
 */
async function shareZip(
  songs: readonly SongListItem[],
  name: string,
  fileName: (song: SongListItem, index: number) => string,
) {
  if (songs.length === 0) throw new Error("Nothing to export.");
  await exportJob(name, songs.length, async (job) => {
    requireRoomFor(songs);
    const folder = freshFolder();
    const exported = new Array<number>();
    for (const [index, song] of songs.entries()) {
      if (job.cancelled()) return;
      job.update(index, (index / songs.length) * COPY_SHARE);
      try {
        await exportCopy(song, folder, fileName(song, index));
        exported.push(song.id);
      } catch {
        // A song whose file is gone is left out.
      }
      await nextTurn();
    }
    if (exported.length === 0) throw new Error("No songs could be exported.");
    job.update(songs.length, COPY_SHARE);
    const archive = new File(EXPORT_DIRECTORY, `${cleanName(name)}.zip`);
    // Audio doesn't compress; storing keeps a big album quick.
    await withZipProgress(
      (fraction) =>
        job.update(songs.length, COPY_SHARE + fraction * (1 - COPY_SHARE)),
      () => zip(pathOf(folder), pathOf(archive), NO_COMPRESSION),
    );
    if (job.cancelled()) return;
    folder.delete();
    job.end();
    await Sharing.shareAsync(archive.uri, {
      mimeType: "application/zip",
      UTI: "public.zip-archive",
    });
    recordExported(exported);
  });
}

/** Shares one song as its own file, under the name it was imported with. */
async function shareFile(song: SongListItem) {
  await exportJob(song.title, 1, async (job) => {
    const copy = await exportCopy(song, freshFolder(), songFile(song).name);
    if (job.cancelled()) return;
    job.end();
    await Sharing.shareAsync(copy.uri);
    recordExported([song.id]);
  });
}

/**
 * Exports songs (the song menu's Share): tags written into a copy, then the
 * share sheet. Several go as one zip (2.5.2's numbered "SYNQ Export N").
 * Resolves when the sheet closes.
 */
export async function exportSongs(songIds: readonly number[]) {
  track("export_song");
  const songs = songsById(songIds);
  const [only] = songs;
  if (only !== undefined && songs.length === 1) {
    await shareFile(only);
    return;
  }
  const number = getBookkeeping().exportNumber + 1;
  updateBookkeeping({ exportNumber: number });
  await shareZip(songs, `SYNQ Export ${String(number)}`, (song, index) =>
    trackFileName(song.title, songFile(song).name, index, songs.length),
  );
}

/** Exports a playlist as a zip named after it, its songs numbered in its order. */
export async function exportPlaylist(playlistId: number) {
  track("export_playlist");
  const db = libraryDb();
  const playlist = getPlaylist(db, playlistId);
  const songs = listPlaylistSongs(db, playlistId);
  await shareZip(songs, playlist?.name ?? "Playlist", (song, index) =>
    trackFileName(song.title, songFile(song).name, index, songs.length),
  );
}

/** Exports an album as a zip named after it, its tracks numbered in track order. */
export async function exportAlbum(albumId: number) {
  track("export_album");
  const db = libraryDb();
  const album = getAlbum(db, albumId);
  const songs = listAlbumTracks(db, albumId);
  await shareZip(songs, album?.name ?? "Album", (song, index) =>
    trackFileName(song.title, songFile(song).name, index, songs.length),
  );
}

/** Exports an artist's songs as a zip named after them. */
export async function exportArtist(artistId: number) {
  track("export_artist");
  const db = libraryDb();
  const artist = getArtist(db, artistId);
  await shareZip(
    getArtistDetail(db, artistId)?.songs ?? [],
    artist?.name ?? "Artist",
    (song) => titleFileName(song.title, songFile(song).name),
  );
}
