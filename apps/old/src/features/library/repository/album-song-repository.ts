import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export const updateAlbumSongOrder = async (
  albumId: number,
  songIds: number[],
) => {
  for (let index = 0; index < songIds.length; index += 1) {
    await db
      .update(schema.albumSongs)
      .set({ track: index + 1 })
      .where(
        and(
          eq(schema.albumSongs.albumId, albumId),
          eq(schema.albumSongs.songId, songIds[index]),
        ),
      );
  }
};
