import { useMemo } from "react";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  compareLibraryText,
  matchesSongQuery,
  normalizeLibraryQuery,
  rowsToSongResults,
  sortSongResults,
} from "@/src/features/library/lib/song-query-results";

type LibrarySongQueryOptions = {
  playlistId?: number;
  pageType?: PageType;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type LibrarySongRow = {
  song: typeof schema.songs.$inferSelect;
  artistName: string | null;
  albumName: string | null;
  albumCoverImage: string | null;
};

const sortSongs = (
  songs: SongType[],
  sort: SortType,
  order: SortOrder,
) => {
  return sortSongResults({
    comparers: {
      [SortType.TITLE]: (first, second) =>
        compareLibraryText(first.title, second.title),
      [SortType.ARTIST]: (first, second) =>
        compareLibraryText(first.artist, second.artist),
      [SortType.ALBUM]: (first, second) =>
        compareLibraryText(first.album, second.album),
    },
    fallbackComparer: (first, second) => first.id - second.id,
    order,
    songs,
    sort,
  });
};

export const useLibrarySongsQuery = ({
  playlistId = 1,
  pageType = PageType.LIBRARY,
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: LibrarySongQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        song: schema.songs,
        artistName: schema.artists.name,
        albumName: schema.albums.name,
        albumCoverImage: schema.albums.coverImage,
      })
      .from(schema.playlistSongs)
      .innerJoin(
        schema.songs,
        eq(schema.playlistSongs.songId, schema.songs.id),
      )
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
      .leftJoin(
        schema.albums,
        and(
          eq(schema.albumSongs.albumId, schema.albums.id),
          eq(schema.albumSongs.songId, schema.songs.id),
        ),
      )
      .where(eq(schema.playlistSongs.playlistId, playlistId)),
  );

  const songs = useMemo(() => {
    const normalizedQuery = normalizeLibraryQuery(query);
    const mappedSongs = rowsToSongResults({
      rows: (data ?? []) as LibrarySongRow[],
      pageType,
    });
    return sortSongs(
      mappedSongs.filter((song) => matchesSongQuery(song, normalizedQuery)),
      sort,
      order,
    );
  }, [data, pageType, query, sort, order]);

  return {
    songs,
    error,
    updatedAt,
    isEmpty: songs.length === 0,
  };
};
