import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { likedSongsPlaylistId } from "../services/library-playlist-constants-service";
import {
  setLikedSongMembershipWithDependencies,
} from "./collection-song-membership-executor-repository";

const findLikedSongRelationshipId = async ({
  ownerId,
  songId,
}: {
  ownerId: number;
  songId: number;
}) => {
  const existing = await db
    .select({ id: schema.playlistSongs.id })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, ownerId),
        eq(schema.playlistSongs.songId, songId),
      ),
    )
    .limit(1);

  return existing[0]?.id ?? null;
};

const loadLikedSongPositions = async (playlistId: number) => {
  const rows = await db
    .select({ position: schema.playlistSongs.position })
    .from(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, playlistId));

  return rows.map((row) => row.position);
};

export async function setLibrarySongLiked({
  liked,
  songId,
}: {
  liked: boolean;
  songId: number;
}) {
  await setLikedSongMembershipWithDependencies(
    {
      liked,
      playlistId: likedSongsPlaylistId,
      songId,
    },
    {
      deleteRelationship: async ({ ownerId, songId }) => {
        await db
          .delete(schema.playlistSongs)
          .where(
            and(
              eq(schema.playlistSongs.playlistId, ownerId),
              eq(schema.playlistSongs.songId, songId),
            ),
          );
      },
      findRelationshipId: findLikedSongRelationshipId,
      insertRelationship: async ({ order, ownerId, songId }) => {
        await db.insert(schema.playlistSongs).values({
          playlistId: ownerId,
          position: order,
          songId,
        });
      },
      loadRelationshipOrders: loadLikedSongPositions,
    },
  );
}
