import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export async function removeArtistSong({
  collectionId,
  songId,
}: {
  collectionId: number;
  songId: number;
}) {
  await db
    .delete(schema.artistSongs)
    .where(
      and(
        eq(schema.artistSongs.artistId, collectionId),
        eq(schema.artistSongs.songId, songId),
      ),
    );
}

export async function updateArtistSongOrder({
  collectionId,
  order,
  songId,
}: {
  collectionId: number;
  order: number;
  songId: number;
}) {
  await db
    .update(schema.artistSongs)
    .set({ position: order })
    .where(
      and(
        eq(schema.artistSongs.artistId, collectionId),
        eq(schema.artistSongs.songId, songId),
      ),
    );
}
