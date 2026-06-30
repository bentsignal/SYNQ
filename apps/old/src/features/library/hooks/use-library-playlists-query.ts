import { useMemo } from "react";
import { PlaylistType, SortOrder, SortType } from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/features/images/repository/image-repository";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { count, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type LibraryPlaylistsQueryOptions = {
  prioritizeSongId?: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type PlaylistRow = {
  id: number;
  name: string | null;
  coverImage: string | null;
  songCount: number;
};

type PlaylistMembershipRow = {
  playlistId: number | null;
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

const prioritizePlaylists = (
  playlists: PlaylistType[],
  priorityIds: Set<number>,
) => {
  if (priorityIds.size === 0) {
    return playlists;
  }

  const selected = playlists.filter((playlist) => priorityIds.has(playlist.id));
  const remaining = playlists.filter(
    (playlist) => !priorityIds.has(playlist.id),
  );

  return [...selected, ...remaining];
};

const rowsToPlaylists = (rows: PlaylistRow[]): PlaylistType[] =>
  rows
    .filter((row) => row.id !== 1)
    .map((row) => ({
      id: row.id,
      name: row.name ?? "",
      songCount: row.songCount,
      image: row.coverImage
        ? getImagePathFromHash(row.coverImage).pathToSmallImage
        : undefined,
    }));

export const useLibraryPlaylistsQuery = ({
  prioritizeSongId,
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: LibraryPlaylistsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
        coverImage: schema.playlists.coverImage,
        songCount: count(schema.playlistSongs.songId),
      })
      .from(schema.playlists)
      .leftJoin(
        schema.playlistSongs,
        eq(schema.playlists.id, schema.playlistSongs.playlistId),
      )
      .groupBy(schema.playlists.id),
  );
  const { data: membershipData } = useLiveQuery(
    db
      .select({
        playlistId: schema.playlistSongs.playlistId,
      })
      .from(schema.playlistSongs)
      .where(eq(schema.playlistSongs.songId, prioritizeSongId ?? -1)),
  );

  const playlists = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    const mappedPlaylists = rowsToPlaylists((data ?? []) as PlaylistRow[]);
    const priorityIds = new Set(
      ((membershipData ?? []) as PlaylistMembershipRow[])
        .map((row) => row.playlistId)
        .filter((id): id is number => typeof id === "number"),
    );
    const filteredPlaylists = mappedPlaylists.filter((playlist) =>
      matchesQuery(playlist, normalizedQuery),
    );

    return prioritizePlaylists(
      prioritizeLikedSongs(sortPlaylists(filteredPlaylists, sort, order)),
      priorityIds,
    );
  }, [data, membershipData, query, sort, order]);

  return {
    playlists,
    error,
    updatedAt,
    isEmpty: playlists.length === 0,
  };
};
