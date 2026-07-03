import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

const getNextAlbumTrack = async (albumId: number) => {
  const rows = await db
    .select({ track: schema.albumSongs.track })
    .from(schema.albumSongs)
    .where(eq(schema.albumSongs.albumId, albumId));
  const highestTrack = rows.reduce(
    (highest, row) => Math.max(highest, row.track ?? 0),
    0,
  );

  return highestTrack + 1;
};

export async function addSongToAlbum({
  albumId,
  songId,
}: {
  albumId: number;
  songId: number;
}) {
  const existing = await db
    .select({ id: schema.albumSongs.id })
    .from(schema.albumSongs)
    .where(
      and(eq(schema.albumSongs.albumId, albumId), eq(schema.albumSongs.songId, songId)),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.albumSongs).values({
      albumId,
      songId,
      track: await getNextAlbumTrack(albumId),
    });
  }
}
