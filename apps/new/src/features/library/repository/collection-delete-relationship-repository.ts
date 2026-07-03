import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const deleteAlbumArtistRows = async (albumId: number) => {
  await db
    .delete(schema.artistsAlbums)
    .where(eq(schema.artistsAlbums.albumId, albumId));
};

export const deleteAlbumSongRows = async (albumId: number) => {
  await db
    .delete(schema.albumSongs)
    .where(eq(schema.albumSongs.albumId, albumId));
};

export const deleteArtistAlbumRows = async (artistId: number) => {
  await db
    .delete(schema.artistsAlbums)
    .where(eq(schema.artistsAlbums.artistId, artistId));
};

export const deleteArtistSongRows = async (artistId: number) => {
  await db
    .delete(schema.artistSongs)
    .where(eq(schema.artistSongs.artistId, artistId));
};

export const deletePlaylistSongRows = async (playlistId: number) => {
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, playlistId));
};
