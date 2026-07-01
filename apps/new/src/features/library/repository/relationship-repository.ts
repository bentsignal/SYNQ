import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";

export async function removeSongFromCollection({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) {
  switch (kind) {
    case "album":
      await db
        .delete(schema.albumSongs)
        .where(
          and(
            eq(schema.albumSongs.albumId, collectionId),
            eq(schema.albumSongs.songId, songId),
          ),
        );
      return;
    case "artist":
      await db
        .delete(schema.artistSongs)
        .where(
          and(
            eq(schema.artistSongs.artistId, collectionId),
            eq(schema.artistSongs.songId, songId),
          ),
        );
      return;
    case "playlist":
      await db
        .delete(schema.playlistSongs)
        .where(
          and(
            eq(schema.playlistSongs.playlistId, collectionId),
            eq(schema.playlistSongs.songId, songId),
          ),
        );
  }
}
