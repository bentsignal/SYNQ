import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  likedSongsPlaylistId,
  systemPlaylistId,
} from "../services/library-playlist-constants-service";
import {
  removeSongFromCollectionWithDependencies,
  updateCollectionSongOrderWithDependencies,
} from "./collection-song-relationship-executor-repository";

const protectedPlaylistIds = new Set([systemPlaylistId, likedSongsPlaylistId]);

const collectionSongRelationshipDependencies = {
  protectedPlaylistIds,
  removeAlbumSong: async ({
    collectionId,
    songId,
  }: {
    collectionId: number;
    songId: number;
  }) => {
    await db
      .delete(schema.albumSongs)
      .where(
        and(
          eq(schema.albumSongs.albumId, collectionId),
          eq(schema.albumSongs.songId, songId),
        ),
      );
  },
  removeArtistSong: async ({
    collectionId,
    songId,
  }: {
    collectionId: number;
    songId: number;
  }) => {
    await db
      .delete(schema.artistSongs)
      .where(
        and(
          eq(schema.artistSongs.artistId, collectionId),
          eq(schema.artistSongs.songId, songId),
        ),
      );
  },
  removePlaylistSong: async ({
    collectionId,
    songId,
  }: {
    collectionId: number;
    songId: number;
  }) => {
    await db
      .delete(schema.playlistSongs)
      .where(
        and(
          eq(schema.playlistSongs.playlistId, collectionId),
          eq(schema.playlistSongs.songId, songId),
        ),
      );
  },
  updateAlbumSongOrder: async ({
    collectionId,
    order,
    songId,
  }: {
    collectionId: number;
    order: number;
    songId: number;
  }) => {
    await db
      .update(schema.albumSongs)
      .set({ track: order })
      .where(
        and(
          eq(schema.albumSongs.albumId, collectionId),
          eq(schema.albumSongs.songId, songId),
        ),
      );
  },
  updateArtistSongOrder: async ({
    collectionId,
    order,
    songId,
  }: {
    collectionId: number;
    order: number;
    songId: number;
  }) => {
    await db
      .update(schema.artistSongs)
      .set({ position: order })
      .where(
        and(
          eq(schema.artistSongs.artistId, collectionId),
          eq(schema.artistSongs.songId, songId),
        ),
      );
  },
  updatePlaylistSongOrder: async ({
    collectionId,
    order,
    songId,
  }: {
    collectionId: number;
    order: number;
    songId: number;
  }) => {
    await db
      .update(schema.playlistSongs)
      .set({ position: order })
      .where(
        and(
          eq(schema.playlistSongs.playlistId, collectionId),
          eq(schema.playlistSongs.songId, songId),
        ),
      );
  },
};

export async function updateCollectionSongOrder({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) {
  await updateCollectionSongOrderWithDependencies(
    {
      collectionId,
      kind,
      songIds,
    },
    collectionSongRelationshipDependencies,
  );
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
  await removeSongFromCollectionWithDependencies(
    {
      collectionId,
      kind,
      songId,
    },
    collectionSongRelationshipDependencies,
  );
}
