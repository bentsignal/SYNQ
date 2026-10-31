import { Directory, File, Paths } from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";

import type { SongTags } from "~/features/media/song-tags";
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

import { track } from "~/features/analytics/analytics";
import { getBookkeeping, updateBookkeeping } from "~/features/import/bookkeeping";
import { audioExtension } from "~/features/import/clean-tags";
import { libraryDb } from "~/features/library/database";
import { readFlacBlocks, readId3Tag } from "~/features/media/heads";
import { buildFlacHead } from "~/features/media/flac";
import { buildId3Tag } from "~/features/media/id3";
import { synqMedia } from "~/features/media/native";
import { isPremium } from "~/features/premium/premium";
import { queryClient } from "~/lib/query-client";

/**
 * Export (Share): copies of songs with the library's current tags (title,
 * artists, album, year, track, artwork) written in, in the share sheet.
 * Library files are never modified. MP3 gets ID3, FLAC Vorbis comments and
 * a PICTURE block, M4A iTunes atoms (remuxed natively); AAC streams and WAV
 * have no tag format worth writing, so they're shared as they are, as is
 * any file that fails to retag.
 */

const EXPORT_DIRECTORY = new Directory(Paths.cache, "export");

function cleanName(name: string) {
  const cleaned = name.replace(/[/\\:\0]/g, "_").trim();
  return cleaned === "" ? "Untitled" : cleaned;
}

/** A name unused in `folder`: "Song.mp3", then "Song 2.mp3". */
function uniqueFile(folder: Directory, name: string) {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  let candidate = new File(folder, name);
  for (let n = 2; candidate.exists; n++) {
    candidate = new File(folder, `${stem} ${String(n)}${extension}`);
  }
  return candidate;
}

function tagsFor(song: SongListItem, cover: File | null) {
  const album = song.albums[0];
  const year =
    album === undefined ? null : (getAlbum(libraryDb(), album.id)?.year ?? null);
  return {
    album: album?.name ?? null,
    artists: song.artists.map((artist) => artist.name),
    artwork: cover === null ? null : cover.bytesSync(),
    title: song.title,
    track: album?.track ?? null,
    year,
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

/** MP3: a new ID3 tag in place of the file's, its other frames kept. */
async function writeMp3(source: File, destination: File, tags: SongTags) {
  const existing = readId3Tag(source);
  const head = buildId3Tag(tags, existing);
  await synqMedia().spliceFile(source.uri, destination.uri, existing?.length ?? 0, head);
  return true;
}

/** FLAC: new metadata blocks in place of the file's. */
async function writeFlac(source: File, destination: File, tags: SongTags) {
  const { blocks, end } = readFlacBlocks(source);
  if (blocks.length === 0) return false;
  const head = buildFlacHead(blocks, tags);
  await synqMedia().spliceFile(source.uri, destination.uri, end, head);
  return true;
}

/** M4A: iTunes atoms, remuxed natively without re-encoding. */
async function writeMp4(
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
 * tag format. False when the format has none worth writing.
 */
function writeTagged(
  source: File,
  destination: File,
  tags: SongTags,
  cover: File | null,
) {
  switch (audioExtension(source.name)) {
    case "mp3":
      return writeMp3(source, destination, tags);
    case "flac":
      return writeFlac(source, destination, tags);
    case "m4a":
      return writeMp4(source, destination, tags, cover);
    case "aac":
    case "wav":
    case null:
      return Promise.resolve(false);
  }
}

/** Writes a tagged copy of `song` into `folder`; returns the copy. */
async function exportCopy(song: SongListItem, folder: Directory) {
  const source = songFile(song);
  const destination = uniqueFile(folder, source.name);
  const cover = coverFile(song);
  // Shared as it is when retagging fails: the music matters more than the tags.
  const tagged = await writeTagged(source, destination, tagsFor(song, cover), cover).catch(
    () => false,
  );
  if (!tagged) {
    if (destination.exists) destination.delete();
    await source.copy(destination);
  }
  return destination;
}

function songsById(ids: readonly number[]) {
  const db = libraryDb();
  return ids.flatMap((id) => getSong(db, id) ?? []);
}

/**
 * Shares songs with their tags written in: one song as its file, several
 * as a folder (named `name`, else 2.5.2's "SYNQ Export N"). Resolves once
 * the share sheet closes; rejects when nothing could be exported.
 */
async function shareSongs(songs: readonly SongListItem[], name?: string) {
  if (songs.length === 0) throw new Error("Nothing to export.");
  const folder = exportFolder(songs.length, name);
  const exported = new Array<number>();
  let shared: File | undefined;
  for (const song of songs) {
    try {
      shared = await exportCopy(song, folder);
      exported.push(song.id);
    } catch {
      // A song whose file is gone is left out.
    }
  }
  if (shared === undefined) throw new Error("No songs could be exported.");
  const many = songs.length > 1;
  await Sharing.shareAsync(many ? folder.uri : shared.uri, {
    UTI: many ? "public.folder" : undefined,
  });
  markSongsExported(libraryDb(), exported);
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  if (EXPORT_DIRECTORY.exists) EXPORT_DIRECTORY.delete();
}

/**
 * A fresh folder for an export: several songs share a folder named `name`
 * (else 2.5.2's numbered batch, "SYNQ Export N").
 */
function exportFolder(count: number, name: string | undefined) {
  if (EXPORT_DIRECTORY.exists) EXPORT_DIRECTORY.delete();
  let folder = new Directory(EXPORT_DIRECTORY, "batch");
  if (count > 1) {
    const number = getBookkeeping().exportNumber + 1;
    updateBookkeeping({ exportNumber: number });
    folder = new Directory(
      EXPORT_DIRECTORY,
      cleanName(name ?? `SYNQ Export ${String(number)}`),
    );
  }
  folder.create({ idempotent: true, intermediates: true });
  return folder;
}

/**
 * Exports songs (the song menu's Share): tags written into copies, then the
 * share sheet. Resolves when the sheet closes.
 */
export async function exportSongs(songIds: readonly number[]) {
  track("export_song");
  await shareSongs(songsById(songIds));
}

/** Free users see the paywall instead; collection exports are Premium. */
function requirePremium() {
  if (isPremium()) return true;
  track("check_premium", { premium: false });
  router.push("/premium");
  return false;
}

/** Exports a playlist's songs as a folder named after it (Premium). */
export async function exportPlaylist(playlistId: number) {
  if (!requirePremium()) return;
  track("export_playlist");
  const db = libraryDb();
  const playlist = getPlaylist(db, playlistId);
  await shareSongs(listPlaylistSongs(db, playlistId), playlist?.name);
}

/** Exports an album's tracks as a folder named after it (Premium). */
export async function exportAlbum(albumId: number) {
  if (!requirePremium()) return;
  track("export_album");
  const db = libraryDb();
  const album = getAlbum(db, albumId);
  await shareSongs(listAlbumTracks(db, albumId), album?.name);
}

/** Exports an artist's songs as a folder named after them (Premium). */
export async function exportArtist(artistId: number) {
  if (!requirePremium()) return;
  track("export_artist");
  const db = libraryDb();
  const artist = getArtist(db, artistId);
  await shareSongs(getArtistDetail(db, artistId)?.songs ?? [], artist?.name);
}
