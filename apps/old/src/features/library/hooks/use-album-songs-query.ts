import { useMemo } from "react";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import {
  compareLibraryText,
  compareOptionalTrack,
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

type AlbumSongsQueryOptions = {
  albumId: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type AlbumSongRow = {
  song: typeof schema.songs.$inferSelect;
  track: number | null;
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
    },
    fallbackComparer: (first, second) =>
      compareOptionalTrack(first.track, second.track),
    order,
    songs,
    sort,
  });
};

export const useAlbumSongsQuery = ({
  albumId,
  query,
  sort = SortType.TRACK,
  order = SortOrder.ASC,
}: AlbumSongsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        song: schema.songs,
        track: schema.albumSongs.track,
        artistName: schema.artists.name,
        albumName: schema.albums.name,
        albumCoverImage: schema.albums.coverImage,
      })
      .from(schema.albumSongs)
      .innerJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id))
      .leftJoin(
        schema.artistSongs,
        eq(schema.songs.id, schema.artistSongs.songId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistSongs.artistId, schema.artists.id),
      )
      .leftJoin(
        schema.albums,
        and(
          eq(schema.albumSongs.albumId, schema.albums.id),
          eq(schema.albumSongs.songId, schema.songs.id),
        ),
      )
      .where(eq(schema.albumSongs.albumId, albumId)),
  );

  const { songs, totalSongCount, totalDuration } = useMemo(() => {
    const normalizedQuery = normalizeLibraryQuery(query);
    const mappedSongs = rowsToSongResults({
      rows: (data ?? []) as AlbumSongRow[],
      pageType: PageType.ALBUM,
    });
    const filteredSongs = mappedSongs.filter((song) =>
      matchesSongQuery(song, normalizedQuery, ["title", "artist"]),
    );
    const summary = getSongResultSummary(mappedSongs);

    return {
      songs: sortSongs(filteredSongs, sort, order),
      totalSongCount: summary.totalSongCount,
      totalDuration: summary.totalDuration,
    };
  }, [data, query, sort, order]);

  return {
    songs,
    totalSongCount,
    totalDuration,
    error,
    updatedAt,
    isEmpty: songs.length === 0,
  };
};
