import { useMemo } from "react";
import { AlbumType, SortOrder, SortType } from "@/src/constants/Types";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type LibraryAlbumsQueryOptions = {
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type AlbumRow = {
  album: typeof schema.albums.$inferSelect;
  artistName: string | null;
  songTitle: string | null;
};

type AlbumSearchEntry = {
  album: AlbumType;
  artistNames: Set<string>;
  songTitles: Set<string>;
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const compareText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

const compareYear = (first?: number, second?: number) => {
  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return first - second;
};

const sortAlbums = (
  albums: AlbumType[],
  sort: SortType,
  order: SortOrder,
) => {
  const sorted = [...albums].sort((first, second) => {
    if (sort === SortType.YEAR) {
      return compareYear(first.year, second.year);
    }

    if (sort === SortType.DATE) {
      return first.id - second.id;
    }

    return compareText(first.name, second.name);
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const matchesQuery = (entry: AlbumSearchEntry, query: string) => {
  if (!query) {
    return true;
  }

  const values = [
    entry.album.name,
    entry.album.year?.toString(),
    ...entry.artistNames,
    ...entry.songTitles,
  ];

  return values.some((value) => value?.toLowerCase().includes(query));
};

const rowsToEntries = (rows: AlbumRow[]) => {
  const albumMap = new Map<number, AlbumSearchEntry>();

  rows.forEach(({ album, artistName, songTitle }) => {
    const current =
      albumMap.get(album.id) ??
      ({
        album: {
          id: album.id,
          name: album.name ?? "",
          year: album.year ?? undefined,
        },
        artistNames: new Set<string>(),
        songTitles: new Set<string>(),
      } satisfies AlbumSearchEntry);

    if (artistName) {
      current.artistNames.add(artistName);
    }

    if (songTitle) {
      current.songTitles.add(songTitle);
    }

    albumMap.set(album.id, current);
  });

  return Array.from(albumMap.values());
};

export const useLibraryAlbumsQuery = ({
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: LibraryAlbumsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        album: schema.albums,
        artistName: schema.artists.name,
        songTitle: schema.songs.title,
      })
      .from(schema.albums)
      .leftJoin(
        schema.artistsAlbums,
        eq(schema.albums.id, schema.artistsAlbums.albumId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistsAlbums.artistId, schema.artists.id),
      )
      .leftJoin(
        schema.albumSongs,
        eq(schema.albums.id, schema.albumSongs.albumId),
      )
      .leftJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id)),
  );

  const albums = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    const entries = rowsToEntries((data ?? []) as AlbumRow[]);
    const filteredAlbums = entries
      .filter((entry) => matchesQuery(entry, normalizedQuery))
      .map((entry) => entry.album);

    return sortAlbums(filteredAlbums, sort, order);
  }, [data, query, sort, order]);

  return {
    albums,
    error,
    updatedAt,
    isEmpty: albums.length === 0,
  };
};
