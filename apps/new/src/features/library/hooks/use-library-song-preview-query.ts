import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  rowsToSongPreviews,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewRow,
  type LibrarySongPreviewSort,
} from "../services/library-song-preview-service";

export type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../services/library-song-preview-service";

type LibrarySongPreviewQueryOptions = {
  limit?: number;
  order?: LibrarySongPreviewOrder;
  query?: string;
  sort?: LibrarySongPreviewSort;
};

export function useLibrarySongPreviewQuery({
  limit = 50,
  order = "desc",
  query,
  sort = "recent",
}: LibrarySongPreviewQueryOptions = {}) {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        pathToFile: schema.songs.pathToFile,
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

  const songs = useMemo(
    () =>
      rowsToSongPreviews({
        limit,
        order,
        query,
        rows: (data ?? []) as LibrarySongPreviewRow[],
        sort,
      }),
    [data, limit, order, query, sort],
  );

  return {
    error,
    isEmpty: songs.length === 0,
    songs,
    updatedAt,
  };
}
