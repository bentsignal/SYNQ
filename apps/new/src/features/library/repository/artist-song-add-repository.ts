import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import {
  addOrderedSongRelationshipWithDependencies,
} from "./collection-song-membership-executor-repository";

const findArtistSongRelationshipId = async ({
  ownerId,
  songId,
}: {
  ownerId: number;
  songId: number;
}) => {
  const existing = await db
    .select({ id: schema.artistSongs.id })
    .from(schema.artistSongs)
    .where(
      and(
        eq(schema.artistSongs.artistId, ownerId),
        eq(schema.artistSongs.songId, songId),
      ),
    )
    .limit(1);

  return existing[0]?.id ?? null;
};

const loadArtistSongPositions = async (artistId: number) => {
  const rows = await db
    .select({ position: schema.artistSongs.position })
    .from(schema.artistSongs)
    .where(eq(schema.artistSongs.artistId, artistId));

  return rows.map((row) => row.position);
};

export async function addSongToArtist({
  artistId,
  songId,
}: {
  artistId: number;
  songId: number;
}) {
  await addOrderedSongRelationshipWithDependencies(
    {
      ownerId: artistId,
      songId,
    },
    {
      findRelationshipId: findArtistSongRelationshipId,
      insertRelationship: async ({ order, ownerId, songId }) => {
        await db.insert(schema.artistSongs).values({
          artistId: ownerId,
          position: order,
          songId,
        });
      },
      loadRelationshipOrders: loadArtistSongPositions,
    },
  );
}
