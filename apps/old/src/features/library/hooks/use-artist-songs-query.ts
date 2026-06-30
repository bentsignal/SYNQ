import { useMemo } from "react";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/lib/image-utils";
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

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const compareText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

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

    if (sort === SortType.ALBUM) {
      return compareText(first.album, second.album);
    }

    return first.id - second.id;
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
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
    const normalizedQuery = normalizeQuery(query);
    const mappedSongs = rowsToSongs((data ?? []) as ArtistSongRow[]);

    return {
      songs: sortSongs(
        mappedSongs.filter((song) => matchesQuery(song, normalizedQuery)),
        sort,
        order,
      ),
      totalSongCount: mappedSongs.length,
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
