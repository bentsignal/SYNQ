import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type SongPreviewRow = {
  songId: number;
  title: string;
  artistName: string | null;
  albumName: string | null;
  duration: number | null;
};

type SongPreviewAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  songId: number;
  title: string;
};

export type LibrarySongPreview = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  title: string;
};

export type LibrarySongPreviewSort = "album" | "artist" | "recent" | "title";

export type LibrarySongPreviewOrder = "asc" | "desc";

type LibrarySongPreviewQueryOptions = {
  limit?: number;
  order?: LibrarySongPreviewOrder;
  query?: string;
  sort?: LibrarySongPreviewSort;
};

const emptyLabel = "Unknown";

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return emptyLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (song: LibrarySongPreview, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

const compareText = (first: string, second: string) =>
  first.localeCompare(second, undefined, { sensitivity: "base" });

const sortSongs = (
  songs: LibrarySongPreview[],
  sort: LibrarySongPreviewSort,
  order: LibrarySongPreviewOrder,
) => {
  const sorted = [...songs].sort((first, second) => {
    switch (sort) {
      case "album":
        return compareText(first.album, second.album) || second.id - first.id;
      case "artist":
        return compareText(first.artist, second.artist) || second.id - first.id;
      case "title":
        return compareText(first.title, second.title) || second.id - first.id;
      case "recent":
      default:
        return second.id - first.id;
    }
  });

  return order === "asc" ? sorted.reverse() : sorted;
};

const rowsToSongPreviews = ({
  limit,
  order,
  query,
  rows,
  sort,
}: {
  limit: number;
  order: LibrarySongPreviewOrder;
  query?: string;
  rows: SongPreviewRow[];
  sort: LibrarySongPreviewSort;
}) => {
  const songMap = new Map<number, SongPreviewAccumulator>();
  const normalizedQuery = normalizeQuery(query);

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        songId: row.songId,
        title: row.title,
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    songMap.set(row.songId, song);
  });

  const songs = Array.from(songMap.values())
    .map<LibrarySongPreview>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.songId,
      title: song.title,
    }))
    .filter((song) => matchesQuery(song, normalizedQuery));

  return sortSongs(songs, sort, order).slice(0, limit);
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
        rows: (data ?? []) as SongPreviewRow[],
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
