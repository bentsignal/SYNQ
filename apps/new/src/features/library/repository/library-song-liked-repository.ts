import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { likedSongsPlaylistId } from "../services/library-playlist-constants-service";

const getNextLikedSongPosition = async () => {
  const rows = await db
    .select({ position: schema.playlistSongs.position })
    .from(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, likedSongsPlaylistId));
  const highestPosition = rows.reduce(
    (highest, row) => Math.max(highest, row.position ?? 0),
    0,
  );

  return highestPosition + 1;
};

export async function setLibrarySongLiked({
  liked,
  songId,
}: {
  liked: boolean;
  songId: number;
}) {
  const existing = await db
    .select({ id: schema.playlistSongs.id })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, likedSongsPlaylistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    )
    .limit(1);

  if (liked) {
    if (existing.length > 0) {
      return;
    }

    await db.insert(schema.playlistSongs).values({
      playlistId: likedSongsPlaylistId,
      position: await getNextLikedSongPosition(),
      songId,
    });
    return;
  }

  await db
    .delete(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, likedSongsPlaylistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );
}
