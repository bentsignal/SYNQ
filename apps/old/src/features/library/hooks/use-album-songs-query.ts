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
  compareOptionalTrack,
  matchesSongQuery,
  normalizeLibraryQuery,
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

type AlbumSong = SongType & {
  artistNames: Set<string>;
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
    },
    fallbackComparer: (first, second) =>
      compareOptionalTrack(first.track, second.track),
    order,
    songs,
    sort,
  });
};

const rowsToSongs = (rows: AlbumSongRow[]) => {
  const songMap = new Map<number, AlbumSong>();

  rows.forEach(({ song, track, artistName, albumName, albumCoverImage }) => {
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
        track: track ?? undefined,
        artwork: song.coverImage
          ? getImagePathFromHash(song.coverImage).pathToFullImage
          : undefined,
        pageType: PageType.ALBUM,
        artistNames: new Set<string>(),
        albumNames: new Set<string>(),
        albumCoverImage: undefined,
      } satisfies AlbumSong);

    if (artistName) {
      current.artistNames.add(artistName);
    }

    if (albumName) {
      current.albumNames.add(albumName);
    }

    current.albumCoverImage = current.albumCoverImage ?? albumCoverImage;

    songMap.set(song.id, current);
  });

  return Array.from(songMap.values()).map((song) => {
    const { artistNames, albumNames, albumCoverImage, ...result } = song;
    return {
      ...result,
      artist: Array.from(artistNames).join(", "),
      album: Array.from(albumNames).join(", "),
      artwork: albumCoverImage
        ? getImagePathFromHash(albumCoverImage).pathToFullImage
        : result.artwork,
    };
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
    const mappedSongs = rowsToSongs((data ?? []) as AlbumSongRow[]);
    const filteredSongs = mappedSongs.filter((song) =>
      matchesSongQuery(song, normalizedQuery, ["title", "artist"]),
    );

    return {
      songs: sortSongs(filteredSongs, sort, order),
      totalSongCount: mappedSongs.length,
      totalDuration: mappedSongs.reduce(
        (acc, song) => acc + (song.duration ?? 0),
        0,
      ),
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
