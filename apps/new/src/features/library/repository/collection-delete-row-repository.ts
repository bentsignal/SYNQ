import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const deleteAlbumRow = async (albumId: number) => {
  await db.delete(schema.albums).where(eq(schema.albums.id, albumId));
};

export const deleteArtistRow = async (artistId: number) => {
  await db.delete(schema.artists).where(eq(schema.artists.id, artistId));
};

export const deletePlaylistRow = async (playlistId: number) => {
  await db.delete(schema.playlists).where(eq(schema.playlists.id, playlistId));
};
