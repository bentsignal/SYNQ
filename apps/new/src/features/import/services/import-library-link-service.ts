import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import type { ImportSongDraft } from "../types/import-session";
import {
  buildImportLibrarySongSavePlan,
  normalizeImportLibraryName,
} from "./import-library-save-plan-service";

const libraryPlaylistId = 1;

const ensureArtist = async (name: string) => {
  const cleanName = normalizeImportLibraryName(name);
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
  const cleanName = normalizeImportLibraryName(name);
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

const updateAlbumCover = async ({
  albumId,
  artwork,
}: {
  albumId: number;
  artwork: string | null;
}) => {
  const coverImage = await saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await db
    .update(schema.albums)
    .set({ coverImage })
    .where(eq(schema.albums.id, albumId));
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
  const albumId = await ensureAlbum(albumName);
  await db.insert(schema.albumSongs).values({
    albumId,
    songId,
    track: song.track,
  });
  await updateAlbumCover({ albumId, artwork: song.artwork });

  for (const artistId of artistIds) {
    await db.insert(schema.artistsAlbums).values({
      albumId,
      artistId,
    });
  }

  return true;
};

export const linkImportSongToLibrary = async ({
  song,
  songId,
}: {
  song: ImportSongDraft;
  songId: number;
}) => {
  const savePlan = buildImportLibrarySongSavePlan(song);
  const artistIds = await linkSongArtists({
    artistNames: savePlan.artistNames,
    songId,
  });

  const linkedAlbum = savePlan.albumName
    ? await linkSongAlbum({
        albumName: savePlan.albumName,
        artistIds,
        song,
        songId,
      })
    : false;

  await linkSongToLibraryPlaylist(songId);

  return { linkedAlbum };
};
