import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import type { LibraryCollectionDetailKind } from "./use-library-collection-detail-query";
import {
  rowsToAddableCollectionSongs,
  type AddableCollectionSongRow,
} from "../services/addable-collection-songs-service";

export type { AddableCollectionSong } from "../services/addable-collection-songs-service";

export function useAddableCollectionSongsQuery({
  collectionId,
  kind,
  query,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  query?: string;
}) {
  const songs = useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        songId: schema.songs.id,
        title: schema.songs.title,
      })
      .from(schema.songs)
      .leftJoin(
        schema.artistSongs,
        eq(schema.songs.id, schema.artistSongs.songId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistSongs.artistId, schema.artists.id),
      )
      .leftJoin(
        schema.albumSongs,
        eq(schema.songs.id, schema.albumSongs.songId),
      )
      .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id)),
  );
  const playlistSongs = useLiveQuery(
    db
      .select({ songId: schema.playlistSongs.songId })
      .from(schema.playlistSongs)
      .where(eq(schema.playlistSongs.playlistId, collectionId)),
  );
  const albumSongs = useLiveQuery(
    db
      .select({ songId: schema.albumSongs.songId })
      .from(schema.albumSongs)
      .where(eq(schema.albumSongs.albumId, collectionId)),
  );
  const artistSongs = useLiveQuery(
    db
      .select({ songId: schema.artistSongs.songId })
      .from(schema.artistSongs)
      .where(eq(schema.artistSongs.artistId, collectionId)),
  );

  const linkedRows =
    kind === "album"
      ? albumSongs.data
      : kind === "artist"
        ? artistSongs.data
        : playlistSongs.data;

  const addableSongs = useMemo(() => {
    const linkedSongIds = new Set(
      (linkedRows ?? []).flatMap((row) =>
        row.songId === null ? [] : [row.songId],
      ),
    );

    return rowsToAddableCollectionSongs({
      linkedSongIds,
      query,
      rows: (songs.data ?? []) as AddableCollectionSongRow[],
    });
  }, [linkedRows, query, songs.data]);

  return {
    errors: [
      songs.error,
      playlistSongs.error,
      albumSongs.error,
      artistSongs.error,
    ].filter(Boolean),
    songs: addableSongs,
    updatedAt: Math.max(
      songs.updatedAt?.getTime() ?? 0,
      playlistSongs.updatedAt?.getTime() ?? 0,
      albumSongs.updatedAt?.getTime() ?? 0,
      artistSongs.updatedAt?.getTime() ?? 0,
    ),
  };
}
