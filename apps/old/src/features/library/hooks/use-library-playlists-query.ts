import { useMemo } from "react";
import { PlaylistType, SortOrder, SortType } from "@/src/constants/Types";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { count, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type LibraryPlaylistsQueryOptions = {
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type PlaylistRow = {
  id: number;
  name: string | null;
  songCount: number;
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (playlist: PlaylistType, query: string) => {
  if (!query) {
    return true;
  }

  return playlist.name.toLowerCase().includes(query);
};

const sortPlaylists = (
  playlists: PlaylistType[],
  sort: SortType,
  order: SortOrder,
) => {
  const sorted = [...playlists].sort((first, second) => {
    if (sort === SortType.TITLE) {
      return first.name.localeCompare(second.name);
    }

    return first.id - second.id;
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const prioritizeLikedSongs = (playlists: PlaylistType[]) => {
  const likedSongs = playlists.find((playlist) => playlist.id === 2);
  const remaining = playlists.filter((playlist) => playlist.id !== 2);

  return likedSongs ? [likedSongs, ...remaining] : remaining;
};

const rowsToPlaylists = (rows: PlaylistRow[]): PlaylistType[] =>
  rows
    .filter((row) => row.id !== 1)
    .map((row) => ({
      id: row.id,
      name: row.name ?? "",
      songCount: row.songCount,
    }));

export const useLibraryPlaylistsQuery = ({
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: LibraryPlaylistsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
        songCount: count(schema.playlistSongs.songId),
      })
      .from(schema.playlists)
      .leftJoin(
        schema.playlistSongs,
        eq(schema.playlists.id, schema.playlistSongs.playlistId),
      )
      .groupBy(schema.playlists.id),
  );

  const playlists = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    const mappedPlaylists = rowsToPlaylists((data ?? []) as PlaylistRow[]);
    const filteredPlaylists = mappedPlaylists.filter((playlist) =>
      matchesQuery(playlist, normalizedQuery),
    );

    return prioritizeLikedSongs(sortPlaylists(filteredPlaylists, sort, order));
  }, [data, query, sort, order]);

  return {
    playlists,
    error,
    updatedAt,
    isEmpty: playlists.length === 0,
  };
};
