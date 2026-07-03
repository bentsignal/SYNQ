import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { isProtectedPlaylistId } from "../services/library-playlist-constants-service";

export async function updateCollectionSongOrder({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) {
  for (let index = 0; index < songIds.length; index += 1) {
    const songId = songIds[index];

    switch (kind) {
      case "album":
        await db
          .update(schema.albumSongs)
          .set({ track: index + 1 })
          .where(
            and(
              eq(schema.albumSongs.albumId, collectionId),
              eq(schema.albumSongs.songId, songId),
            ),
          );
        break;
      case "artist":
        await db
          .update(schema.artistSongs)
          .set({ position: index + 1 })
          .where(
            and(
              eq(schema.artistSongs.artistId, collectionId),
              eq(schema.artistSongs.songId, songId),
            ),
          );
        break;
      case "playlist":
        if (isProtectedPlaylistId(collectionId)) {
          throw new Error("This protected playlist cannot be changed.");
        }

        await db
          .update(schema.playlistSongs)
          .set({ position: index + 1 })
          .where(
            and(
              eq(schema.playlistSongs.playlistId, collectionId),
              eq(schema.playlistSongs.songId, songId),
            ),
          );
        break;
    }
  }
}

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
      if (isProtectedPlaylistId(collectionId)) {
        throw new Error("This protected playlist cannot be changed.");
      }

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
