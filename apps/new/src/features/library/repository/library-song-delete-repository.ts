import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";

export async function deleteLibrarySong(songId: number) {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  await db.delete(schema.artistSongs).where(eq(schema.artistSongs.songId, songId));
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
  await db.delete(schema.songs).where(eq(schema.songs.id, songId));

  if (FileSystem.documentDirectory) {
    await FileSystem.deleteAsync(
      `${FileSystem.documentDirectory}library/${songId}`,
      { idempotent: true },
    );
  }
}
