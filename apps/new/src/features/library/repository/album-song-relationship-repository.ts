import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export async function removeAlbumSong({
  collectionId,
  songId,
}: {
  collectionId: number;
  songId: number;
}) {
  await db
    .delete(schema.albumSongs)
    .where(
      and(
        eq(schema.albumSongs.albumId, collectionId),
        eq(schema.albumSongs.songId, songId),
      ),
    );
}

export async function updateAlbumSongOrder({
  collectionId,
  order,
  songId,
}: {
  collectionId: number;
  order: number;
  songId: number;
}) {
  await db
    .update(schema.albumSongs)
    .set({ track: order })
    .where(
      and(
        eq(schema.albumSongs.albumId, collectionId),
        eq(schema.albumSongs.songId, songId),
      ),
    );
}
