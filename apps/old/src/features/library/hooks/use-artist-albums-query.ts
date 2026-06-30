import { useMemo } from "react";
import { AlbumType, SortOrder, SortType } from "@/src/constants/Types";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type ArtistAlbumsQueryOptions = {
  artistId: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
};

type ArtistAlbumRow = {
  album: typeof schema.albums.$inferSelect;
  songTitle: string | null;
};

type ArtistAlbumSearchEntry = {
  album: AlbumType;
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

    return compareText(first.name, second.name);
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const matchesQuery = (entry: ArtistAlbumSearchEntry, query: string) => {
  if (!query) {
    return true;
  }

  const values = [
    entry.album.name,
    entry.album.year?.toString(),
    ...entry.songTitles,
  ];

  return values.some((value) => value?.toLowerCase().includes(query));
};

const rowsToEntries = (rows: ArtistAlbumRow[]) => {
  const albumMap = new Map<number, ArtistAlbumSearchEntry>();

  rows.forEach(({ album, songTitle }) => {
    const current =
      albumMap.get(album.id) ??
      ({
        album: {
          id: album.id,
          name: album.name ?? "",
          year: album.year ?? undefined,
        },
        songTitles: new Set<string>(),
      } satisfies ArtistAlbumSearchEntry);

    if (songTitle) {
      current.songTitles.add(songTitle);
    }

    albumMap.set(album.id, current);
  });

  return Array.from(albumMap.values());
};

export const useArtistAlbumsQuery = ({
  artistId,
  query,
  sort = SortType.ALBUM,
  order = SortOrder.ASC,
}: ArtistAlbumsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        album: schema.albums,
        songTitle: schema.songs.title,
      })
      .from(schema.artistsAlbums)
      .innerJoin(
        schema.albums,
        eq(schema.artistsAlbums.albumId, schema.albums.id),
      )
      .leftJoin(
        schema.albumSongs,
        eq(schema.albums.id, schema.albumSongs.albumId),
      )
      .leftJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id))
      .where(eq(schema.artistsAlbums.artistId, artistId)),
  );

  const albums = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    const entries = rowsToEntries((data ?? []) as ArtistAlbumRow[]);
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
