import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

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
          position: await getNextArtistPosition(collectionId),
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
          position: await getNextPlaylistPosition(collectionId),
          songId,
        });
      }
    }
  }
}

export async function addSongsToCollection({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) {
  for (const songId of songIds) {
    await addSongToCollection({
      collectionId,
      kind,
      songId,
    });
  }
}
