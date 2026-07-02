import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";

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

export async function addSongToCollection({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) {
  switch (kind) {
    case "album": {
      const existing = await db
        .select({ id: schema.albumSongs.id })
        .from(schema.albumSongs)
        .where(
          and(
            eq(schema.albumSongs.albumId, collectionId),
            eq(schema.albumSongs.songId, songId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.albumSongs).values({
          albumId: collectionId,
          songId,
          track: await getNextAlbumTrack(collectionId),
        });
      }

      return;
    }
    case "artist": {
      const existing = await db
        .select({ id: schema.artistSongs.id })
        .from(schema.artistSongs)
        .where(
          and(
            eq(schema.artistSongs.artistId, collectionId),
            eq(schema.artistSongs.songId, songId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.artistSongs).values({
          artistId: collectionId,
          songId,
        });
      }

      return;
    }
    case "playlist": {
      const existing = await db
        .select({ id: schema.playlistSongs.id })
        .from(schema.playlistSongs)
        .where(
          and(
            eq(schema.playlistSongs.playlistId, collectionId),
            eq(schema.playlistSongs.songId, songId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.playlistSongs).values({
          playlistId: collectionId,
          songId,
        });
      }
    }
  }
}

export async function updateAlbumSongOrder({
  albumId,
  songIds,
}: {
  albumId: number;
  songIds: number[];
}) {
  for (let index = 0; index < songIds.length; index += 1) {
    const songId = songIds[index];

    await db
      .update(schema.albumSongs)
      .set({ track: index + 1 })
      .where(
        and(
          eq(schema.albumSongs.albumId, albumId),
          eq(schema.albumSongs.songId, songId),
        ),
      );
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
