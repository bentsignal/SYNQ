import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";
import {
  deleteLibrarySongWithDependencies,
  getLibrarySongDirectoryPath,
  type LibrarySongDeleteDependencies,
} from "./library-song-delete-executor-repository";

const librarySongDeleteDependencies: LibrarySongDeleteDependencies = {
  deleteAlbumSongRows: async (songId) => {
    await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  },
  deleteArtistSongRows: async (songId) => {
    await db
      .delete(schema.artistSongs)
      .where(eq(schema.artistSongs.songId, songId));
  },
  deleteLibrarySongFiles: (songId) =>
    FileSystem.deleteAsync(
      getLibrarySongDirectoryPath({
        documentDirectory: FileSystem.documentDirectory ?? "",
        songId,
      }),
      { idempotent: true },
    ),
  deletePlaylistSongRows: async (songId) => {
    await db
      .delete(schema.playlistSongs)
      .where(eq(schema.playlistSongs.songId, songId));
  },
  deleteSongRow: async (songId) => {
    await db.delete(schema.songs).where(eq(schema.songs.id, songId));
  },
  documentDirectory: FileSystem.documentDirectory,
};

export async function deleteLibrarySong(songId: number) {
  await deleteLibrarySongWithDependencies(
    songId,
    librarySongDeleteDependencies,
  );
}
