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
  return {
    album: album?.name ?? null,
    artists: song.artists.map((artist) => artist.name),
    artwork: cover?.exists === true ? cover.bytesSync() : null,
    title: song.title,
    track: album?.track ?? null,
    year:
      album === undefined ? null : (getAlbum(libraryDb(), album.id)?.year ?? null),
  } satisfies SongTags;
}

/** Writes a tagged copy of `song` into `folder`; returns the copy. */
async function exportCopy(song: SongListItem, folder: Directory) {
  if (song.filePath === null) throw new Error("The song has no file.");
  const source = documentFile(song.filePath);
  if (!source.exists) throw new Error("The song's file is missing.");
  const destination = uniqueFile(folder, source.name);
  const cover =
    song.artwork === null ? null : documentFile(artworkPath(song.artwork, "full"));
  const tags = tagsFor(song, cover);
  const media = synqMedia();
  try {
    switch (audioExtension(source.name)) {
      case "mp3": {
        const existing = readId3Tag(source);
        await media.spliceFile(
          source.uri,
          destination.uri,
          existing?.length ?? 0,
          buildId3Tag(tags, existing),
        );
        return destination;
      }
      case "flac": {
        const { blocks, end } = readFlacBlocks(source);
        if (blocks.length === 0) break;
        await media.spliceFile(
          source.uri,
          destination.uri,
          end,
          buildFlacHead(blocks, tags),
        );
        return destination;
      }
      case "m4a":
        await media.tagMp4(
          source.uri,
          destination.uri,
          {
            album: tags.album,
            artist: tags.artists.length > 0 ? tags.artists.join(", ") : null,
            title: tags.title === "" ? null : tags.title,
            track: tags.track,
            year: tags.year,
          },
          cover?.exists === true ? cover.uri : null,
        );
        return destination;
      default:
        break;
    }
  } catch {
    // Shared as it is below: the music matters more than the tags.
    if (destination.exists) destination.delete();
  }
  await source.copy(destination);
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
  if (EXPORT_DIRECTORY.exists) EXPORT_DIRECTORY.delete();
  let folder = new Directory(EXPORT_DIRECTORY, "batch");
  if (songs.length > 1) {
    const number = getBookkeeping().exportNumber + 1;
    updateBookkeeping({ exportNumber: number });
    folder = new Directory(
      EXPORT_DIRECTORY,
      cleanName(name ?? `SYNQ Export ${String(number)}`),
    );
  }
  folder.create({ idempotent: true, intermediates: true });
  const exported: number[] = [];
  let shared: File | null = null;
  for (const song of songs) {
    try {
      shared = await exportCopy(song, folder);
      exported.push(song.id);
    } catch {
      // A song whose file is gone is left out.
    }
  }
  if (shared === null) throw new Error("No songs could be exported.");
  await Sharing.shareAsync(songs.length > 1 ? folder.uri : shared.uri, {
    UTI: songs.length > 1 ? "public.folder" : undefined,
  });
  markSongsExported(libraryDb(), exported);
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  if (EXPORT_DIRECTORY.exists) EXPORT_DIRECTORY.delete();
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
