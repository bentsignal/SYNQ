import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  deleteLibrarySongRowsWithDependencies,
  type LibrarySongDeleteRowDependencies,
} from "./library-song-delete-executor-repository";

const librarySongDeleteRowDependencies: LibrarySongDeleteRowDependencies = {
  deleteAlbumSongRows: async (songId) => {
    await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  },
  deleteArtistSongRows: async (songId) => {
    await db
      .delete(schema.artistSongs)
      .where(eq(schema.artistSongs.songId, songId));
  },
  deletePlaylistSongRows: async (songId) => {
    await db
      .delete(schema.playlistSongs)
      .where(eq(schema.playlistSongs.songId, songId));
  },
  deleteSongRow: async (songId) => {
    await db.delete(schema.songs).where(eq(schema.songs.id, songId));
  },
};

export async function deleteLibrarySongRows(songId: number) {
  await deleteLibrarySongRowsWithDependencies(
    songId,
    librarySongDeleteRowDependencies,
  );
}
