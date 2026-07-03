import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import {
  addOrderedSongRelationshipWithDependencies,
} from "./collection-song-membership-executor-repository";

const findAlbumSongRelationshipId = async ({
  ownerId,
  songId,
}: {
  ownerId: number;
  songId: number;
}) => {
  const existing = await db
    .select({ id: schema.albumSongs.id })
    .from(schema.albumSongs)
    .where(
      and(eq(schema.albumSongs.albumId, ownerId), eq(schema.albumSongs.songId, songId)),
    )
    .limit(1);

  return existing[0]?.id ?? null;
};

const loadAlbumSongTracks = async (albumId: number) => {
  const rows = await db
    .select({ track: schema.albumSongs.track })
    .from(schema.albumSongs)
    .where(eq(schema.albumSongs.albumId, albumId));

  return rows.map((row) => row.track);
};

export async function addSongToAlbum({
  albumId,
  songId,
}: {
  albumId: number;
  songId: number;
}) {
  await addOrderedSongRelationshipWithDependencies(
    {
      ownerId: albumId,
      songId,
    },
    {
      findRelationshipId: findAlbumSongRelationshipId,
      insertRelationship: async ({ order, ownerId, songId }) => {
        await db.insert(schema.albumSongs).values({
          albumId: ownerId,
          songId,
          track: order,
        });
      },
      loadRelationshipOrders: loadAlbumSongTracks,
    },
  );
}
