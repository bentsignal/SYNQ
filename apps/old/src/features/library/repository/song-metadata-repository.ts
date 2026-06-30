import { saveCoverImage } from "@/src/features/images/repository/image-repository";
import {
  getLibraryAlbumFromMetadata,
  getLibraryArtistsFromMetadata,
} from "@/src/features/library/repository/library-entity-repository";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";

type UpdateLibrarySongMetadataInput = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
};

type UpdateLibrarySongsInput = {
  ids: number[];
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
};

const replaceSongArtists = async (songId: number, artistValue: string) => {
  const artists = await getLibraryArtistsFromMetadata(artistValue);

  await db
    .delete(schema.artistSongs)
    .where(eq(schema.artistSongs.songId, songId));

  if (artists.length === 0) {
    return;
  }

  await db.insert(schema.artistSongs).values(
    artists.map((artist) => ({
      artistId: artist.id,
      songId,
    })),
  );
};

const replaceSongAlbum = async (songId: number, albumValue: string) => {
  const album = await getLibraryAlbumFromMetadata(albumValue);

  await db
    .delete(schema.albumSongs)
    .where(eq(schema.albumSongs.songId, songId));

  if (!album) {
    return;
  }

  await db.insert(schema.albumSongs).values({
    albumId: album.id,
    songId,
  });
};

const getLibrarySongSnapshotHash = async (songId: number) => {
  const songRows = await db
    .select()
    .from(schema.songs)
    .where(eq(schema.songs.id, songId))
    .limit(1);
  const song = songRows[0];

  if (!song) {
    throw new Error(`Song ${songId} not found`);
  }

  const albumsContainingSong = await db
    .select({
      name: schema.albums.name,
      year: schema.albums.year,
      coverImage: schema.albums.coverImage,
    })
    .from(schema.albumSongs)
    .innerJoin(
      schema.albums,
      eq(schema.albumSongs.albumId, schema.albums.id),
    )
    .where(eq(schema.albumSongs.songId, songId));
  const albumNames = albumsContainingSong
    .map(
      (album) =>
        `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`,
    )
    .sort()
    .join(",");

  const artistsOnSong = await db
    .select({ name: schema.artists.name })
    .from(schema.artistSongs)
    .innerJoin(
      schema.artists,
      eq(schema.artistSongs.artistId, schema.artists.id),
    )
    .where(eq(schema.artistSongs.songId, songId));
  const artistNames = artistsOnSong
    .map((artist) => artist.name ?? "")
    .sort()
    .join(",");

  const hashInput = [
    song.title,
    song.duration,
    song.fileType,
    song.coverImage,
    artistNames,
    albumNames,
  ].join("-");

  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hashInput,
  );
};

export const saveLibrarySongSnapshot = async (songId: number) => {
  const snapshotAtLastExport = await getLibrarySongSnapshotHash(songId);

  await db
    .update(schema.songs)
    .set({ snapshotAtLastExport })
    .where(eq(schema.songs.id, songId));
};

export const isLibrarySongSnapshotStale = async (songId: number) => {
  const songRows = await db
    .select({ snapshotAtLastExport: schema.songs.snapshotAtLastExport })
    .from(schema.songs)
    .where(eq(schema.songs.id, songId))
    .limit(1);
  const snapshotAtLastExport = songRows[0]?.snapshotAtLastExport;

  if (songRows.length === 0) {
    return null;
  }

  if (!snapshotAtLastExport) {
    return true;
  }

  return (await getLibrarySongSnapshotHash(songId)) !== snapshotAtLastExport;
};

export const updateLibrarySongMetadata = async ({
  id,
  title,
  artist,
  album,
}: UpdateLibrarySongMetadataInput) => {
  await db
    .update(schema.songs)
    .set({
      title,
    })
    .where(eq(schema.songs.id, id));

  if (artist !== undefined) {
    await replaceSongArtists(id, artist);
  }

  if (album !== undefined) {
    await replaceSongAlbum(id, album);
  }
};

export const updateLibrarySongCover = async (songId: number, cover: string) => {
  const coverImage = await saveCoverImage(cover);

  if (!coverImage) {
    return;
  }

  const albumsContainingSong = await db
    .select({ albumId: schema.albumSongs.albumId })
    .from(schema.albumSongs)
    .where(eq(schema.albumSongs.songId, songId))
    .limit(1);
  const albumId = albumsContainingSong[0]?.albumId;

  if (albumId) {
    await db
      .update(schema.albums)
      .set({ coverImage })
      .where(eq(schema.albums.id, albumId));
    return;
  }

  await db
    .update(schema.songs)
    .set({ coverImage })
    .where(eq(schema.songs.id, songId));
};

export const flagLibrarySongAsEdited = async (songId: number) => {
  await db
    .update(schema.songs)
    .set({ snapshotAtLastExport: null })
    .where(eq(schema.songs.id, songId));
};

export const markLibrarySongAsExported = async (songId: number) => {
  await saveLibrarySongSnapshot(songId);
};

export const updateLibrarySongs = async ({
  ids,
  title,
  artist,
  album,
  cover,
}: UpdateLibrarySongsInput) => {
  for (const id of ids) {
    if (cover) {
      await updateLibrarySongCover(id, cover);
    }

    if (title || artist || album) {
      await updateLibrarySongMetadata({
        id,
        title,
        artist,
        album,
      });
    }
  }
};
