import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export async function removePlaylistSong({
  collectionId,
  songId,
}: {
  collectionId: number;
  songId: number;
}) {
  await db
    .delete(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, collectionId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );
}

export async function updatePlaylistSongOrder({
  collectionId,
  order,
  songId,
}: {
  collectionId: number;
  order: number;
  songId: number;
}) {
  await db
    .update(schema.playlistSongs)
    .set({ position: order })
    .where(
      and(
        eq(schema.playlistSongs.playlistId, collectionId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );
}
