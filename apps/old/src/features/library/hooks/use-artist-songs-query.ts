import { useMemo } from "react";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import {
  compareLibraryText,
  getSongResultSummary,
  matchesSongQuery,
  normalizeLibraryQuery,
  rowsToSongResults,
  sortSongResults,
} from "@/src/features/library/lib/song-query-results";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type ArtistSongsQueryOptions = {
  artistId: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type ArtistSongRow = {
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
      [SortType.ALBUM]: (first, second) =>
        compareLibraryText(first.album, second.album),
    },
    fallbackComparer: (first, second) => first.id - second.id,
    order,
    songs,
    sort,
  });
};

export const useArtistSongsQuery = ({
  artistId,
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: ArtistSongsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        song: schema.songs,
        artistName: schema.artists.name,
        albumName: schema.albums.name,
        albumCoverImage: schema.albums.coverImage,
      })
      .from(schema.artistSongs)
      .innerJoin(schema.songs, eq(schema.artistSongs.songId, schema.songs.id))
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
      .where(eq(schema.artistSongs.artistId, artistId)),
  );

  const { songs, totalSongCount } = useMemo(() => {
    const normalizedQuery = normalizeLibraryQuery(query);
    const mappedSongs = rowsToSongResults({
      rows: (data ?? []) as ArtistSongRow[],
      pageType: PageType.ARTIST,
    });
    const summary = getSongResultSummary(mappedSongs);

    return {
      songs: sortSongs(
        mappedSongs.filter((song) => matchesSongQuery(song, normalizedQuery)),
        sort,
        order,
      ),
      totalSongCount: summary.totalSongCount,
    };
  }, [data, query, sort, order]);

  return {
    songs,
    totalSongCount,
    error,
    updatedAt,
    isEmpty: songs.length === 0,
  };
};
