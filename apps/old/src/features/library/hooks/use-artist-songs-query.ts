import { useMemo } from "react";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/features/images/repository/image-repository";
import {
  compareLibraryText,
  getSongResultSummary,
  matchesSongQuery,
  normalizeLibraryQuery,
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

type ArtistSong = SongType & {
  albumNames: Set<string>;
  albumCoverImage?: string | null;
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

const rowsToSongs = (rows: ArtistSongRow[]) => {
  const songMap = new Map<number, ArtistSong>();

  rows.forEach(({ song, artistName, albumName, albumCoverImage }) => {
    const current =
      songMap.get(song.id) ??
      ({
        id: song.id,
        edited: false,
        fileName: song.originalFileName ?? undefined,
        fileType: song.fileType ?? undefined,
        format: "id3v2.4",
        title: song.title ?? undefined,
        duration: song.duration ?? undefined,
        artwork: song.coverImage
          ? getImagePathFromHash(song.coverImage).pathToFullImage
          : undefined,
        pageType: PageType.ARTIST,
        artist: artistName ?? undefined,
        albumNames: new Set<string>(),
        albumCoverImage: undefined,
      } satisfies ArtistSong);

    if (artistName && !current.artist) {
      current.artist = artistName;
    }

    if (albumName) {
      current.albumNames.add(albumName);
    }

    current.albumCoverImage = current.albumCoverImage ?? albumCoverImage;

    songMap.set(song.id, current);
  });

  return Array.from(songMap.values()).map((song) => {
    const { albumNames, albumCoverImage, ...result } = song;
    return {
      ...result,
      album: Array.from(albumNames).join(", "),
      artwork: albumCoverImage
        ? getImagePathFromHash(albumCoverImage).pathToFullImage
        : result.artwork,
    };
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
    const mappedSongs = rowsToSongs((data ?? []) as ArtistSongRow[]);
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
