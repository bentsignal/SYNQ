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
import { getImagePathFromHash } from "@/src/features/images/repository/image-repository";

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

const compareText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (song: SongType, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value?.toLowerCase().includes(query),
  );
};

const sortSongs = (
  songs: SongType[],
  sort: SortType,
  order: SortOrder,
) => {
  const sorted = [...songs].sort((first, second) => {
    if (sort === SortType.TITLE) {
      return compareText(first.title, second.title);
    }

    if (sort === SortType.ARTIST) {
      return compareText(first.artist, second.artist);
    }

    if (sort === SortType.ALBUM) {
      return compareText(first.album, second.album);
    }

    return first.id - second.id;
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const rowsToSongs = (rows: LibrarySongRow[], pageType: PageType) => {
  const songMap = new Map<
    number,
    SongType & {
      artistNames: Set<string>;
      albumNames: Set<string>;
      albumCoverImage?: string | null;
    }
  >();

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
        pageType,
        artistNames: new Set<string>(),
        albumNames: new Set<string>(),
        albumCoverImage: undefined,
      } satisfies SongType & {
        artistNames: Set<string>;
        albumNames: Set<string>;
        albumCoverImage?: string | null;
      });

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
    const normalizedQuery = normalizeQuery(query);
    const mappedSongs = rowsToSongs((data ?? []) as LibrarySongRow[], pageType);
    return sortSongs(
      mappedSongs.filter((song) => matchesQuery(song, normalizedQuery)),
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
