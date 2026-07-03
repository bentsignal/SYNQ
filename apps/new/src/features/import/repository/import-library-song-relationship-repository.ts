import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const deleteImportLibraryAlbumSongRows = async (songId: number) => {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
};

export const deleteImportLibraryArtistSongRows = async (songId: number) => {
  await db
    .delete(schema.artistSongs)
    .where(eq(schema.artistSongs.songId, songId));
};

export const deleteImportLibraryPlaylistSongRows = async (songId: number) => {
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
};
