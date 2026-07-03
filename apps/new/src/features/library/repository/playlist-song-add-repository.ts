import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { isProtectedPlaylistId } from "../services/library-playlist-constants-service";

const getNextPlaylistPosition = async (playlistId: number) => {
  const rows = await db
    .select({ position: schema.playlistSongs.position })
    .from(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, playlistId));
  const highestPosition = rows.reduce(
    (highest, row) => Math.max(highest, row.position ?? 0),
    0,
  );

  return highestPosition + 1;
};

export async function addSongToPlaylist({
  playlistId,
  songId,
}: {
  playlistId: number;
  songId: number;
}) {
  if (isProtectedPlaylistId(playlistId)) {
    throw new Error("This protected playlist cannot be changed.");
  }

  const existing = await db
    .select({ id: schema.playlistSongs.id })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, playlistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.playlistSongs).values({
      playlistId,
      position: await getNextPlaylistPosition(playlistId),
      songId,
    });
  }
}
