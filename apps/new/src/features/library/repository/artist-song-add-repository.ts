import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

const getNextArtistPosition = async (artistId: number) => {
  const rows = await db
    .select({ position: schema.artistSongs.position })
    .from(schema.artistSongs)
    .where(eq(schema.artistSongs.artistId, artistId));
  const highestPosition = rows.reduce(
    (highest, row) => Math.max(highest, row.position ?? 0),
    0,
  );

  return highestPosition + 1;
};

export async function addSongToArtist({
  artistId,
  songId,
}: {
  artistId: number;
  songId: number;
}) {
  const existing = await db
    .select({ id: schema.artistSongs.id })
    .from(schema.artistSongs)
    .where(
      and(
        eq(schema.artistSongs.artistId, artistId),
        eq(schema.artistSongs.songId, songId),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.artistSongs).values({
      artistId,
      position: await getNextArtistPosition(artistId),
      songId,
    });
  }
}
