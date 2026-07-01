import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";

const libraryPlaylistId = 1;

const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);

const normalizeName = (name: string) => name.trim();

const hasMeaningfulName = (name: string) =>
  !unknownLabels.has(normalizeName(name).toLowerCase());

const splitNames = (value: string) =>
  value
    .split(",")
    .map(normalizeName)
    .filter(hasMeaningfulName);

const ensureArtist = async (name: string) => {
  const cleanName = normalizeName(name);
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, cleanName))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.artists)
    .values({ name: cleanName })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

const ensureAlbum = async (name: string) => {
  const cleanName = normalizeName(name);
  const existing = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, cleanName))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.albums)
    .values({ name: cleanName })
    .returning({ id: schema.albums.id });

  return inserted[0].id;
};

const insertSongDraft = async (song: ImportSongDraft) => {
  const inserted = await db
    .insert(schema.songs)
    .values({
      duration: song.duration,
      fileType: song.fileType,
      ingestComplete: 1,
      originalFileName: song.fileName,
      pathToFile: song.cacheUri,
      title: song.title,
    })
    .returning({ id: schema.songs.id });

  return inserted[0].id;
};

const linkSongToLibraryPlaylist = async (songId: number) => {
  await db.insert(schema.playlistSongs).values({
    playlistId: libraryPlaylistId,
    songId,
  });
};

const linkSongArtists = async ({
  artistNames,
  songId,
}: {
  artistNames: string[];
  songId: number;
}) => {
  const artistIds: number[] = [];

  for (const artistName of artistNames) {
    const artistId = await ensureArtist(artistName);
    artistIds.push(artistId);
    await db.insert(schema.artistSongs).values({
      artistId,
      songId,
    });
  }

  return artistIds;
};

const linkSongAlbum = async ({
  albumName,
  artistIds,
  song,
  songId,
}: {
  albumName: string;
  artistIds: number[];
  song: ImportSongDraft;
  songId: number;
}) => {
  if (!hasMeaningfulName(albumName)) {
    return;
  }

  const albumId = await ensureAlbum(albumName);
  await db.insert(schema.albumSongs).values({
    albumId,
    songId,
    track: song.track,
  });

  for (const artistId of artistIds) {
    await db.insert(schema.artistsAlbums).values({
      albumId,
      artistId,
    });
  }
};

const saveOneImportSong = async (song: ImportSongDraft) => {
  const songId = await insertSongDraft(song);
  const artistIds = await linkSongArtists({
    artistNames: splitNames(song.artist),
    songId,
  });

  await linkSongAlbum({
    albumName: song.album,
    artistIds,
    song,
    songId,
  });
  await linkSongToLibraryPlaylist(songId);

  return songId;
};

export async function saveImportSessionToLibrary(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  const savedSongIds: number[] = [];

  for (const song of songs) {
    savedSongIds.push(await saveOneImportSong(song));
  }

  return {
    discarded: 0,
    saved: savedSongIds.length,
    savedSongIds,
  };
}

export async function discardImportSession(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  return {
    discarded: songs.length,
    saved: 0,
    savedSongIds: [],
  };
}
