import { useMemo } from "react";
import {
  ArtistType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/lib/image-utils";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type LibraryArtistsQueryOptions = {
  prioritizeSongId?: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
  sourceType?: SourceType;
};

type ArtistRow = {
  artist: typeof schema.artists.$inferSelect;
  songTitle: string | null;
  albumName: string | null;
};

type ArtistMembershipRow = {
  artistId: number | null;
};

type ArtistSearchEntry = {
  artist: ArtistType;
  songTitles: Set<string>;
  albumNames: Set<string>;
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const compareText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

const sortArtists = (
  artists: ArtistType[],
  sort: SortType,
  order: SortOrder,
) => {
  const sorted = [...artists].sort((first, second) => {
    if (sort === SortType.DATE) {
      return first.id - second.id;
    }

    return compareText(first.name, second.name);
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const prioritizeArtists = (
  artists: ArtistType[],
  priorityIds: Set<number>,
) => {
  if (priorityIds.size === 0) {
    return artists;
  }

  const selected = artists.filter((artist) => priorityIds.has(artist.id));
  const remaining = artists.filter((artist) => !priorityIds.has(artist.id));

  return [...selected, ...remaining];
};

const matchesQuery = (entry: ArtistSearchEntry, query: string) => {
  if (!query) {
    return true;
  }

  const values = [entry.artist.name, ...entry.songTitles, ...entry.albumNames];

  return values.some((value) => value?.toLowerCase().includes(query));
};

const rowsToEntries = (rows: ArtistRow[], sourceType?: SourceType) => {
  const artistMap = new Map<number, ArtistSearchEntry>();

  rows.forEach(({ artist, songTitle, albumName }) => {
    const current =
      artistMap.get(artist.id) ??
      ({
        artist: {
          id: artist.id,
          name: artist.name ?? "",
          image: artist.profileImage
            ? getImagePathFromHash(artist.profileImage).pathToSmallImage
            : undefined,
          sourceType,
        },
        songTitles: new Set<string>(),
        albumNames: new Set<string>(),
      } satisfies ArtistSearchEntry);

    if (songTitle) {
      current.songTitles.add(songTitle);
    }

    if (albumName) {
      current.albumNames.add(albumName);
    }

    artistMap.set(artist.id, current);
  });

  return Array.from(artistMap.values());
};

export const useLibraryArtistsQuery = ({
  prioritizeSongId,
  query,
  sort = SortType.ARTIST,
  order = SortOrder.ASC,
  sourceType,
}: LibraryArtistsQueryOptions) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        artist: schema.artists,
        songTitle: schema.songs.title,
        albumName: schema.albums.name,
      })
      .from(schema.artists)
      .leftJoin(
        schema.artistSongs,
        eq(schema.artists.id, schema.artistSongs.artistId),
      )
      .leftJoin(schema.songs, eq(schema.artistSongs.songId, schema.songs.id))
      .leftJoin(
        schema.albumSongs,
        eq(schema.songs.id, schema.albumSongs.songId),
      )
      .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id)),
  );
  const { data: membershipData } = useLiveQuery(
    db
      .select({
        artistId: schema.artistSongs.artistId,
      })
      .from(schema.artistSongs)
      .where(eq(schema.artistSongs.songId, prioritizeSongId ?? -1)),
  );

  const artists = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    const entries = rowsToEntries((data ?? []) as ArtistRow[], sourceType);
    const priorityIds = new Set(
      ((membershipData ?? []) as ArtistMembershipRow[])
        .map((row) => row.artistId)
        .filter((id): id is number => typeof id === "number"),
    );
    const filteredArtists = entries
      .filter((entry) => matchesQuery(entry, normalizedQuery))
      .map((entry) => entry.artist);

    return prioritizeArtists(
      sortArtists(filteredArtists, sort, order),
      priorityIds,
    );
  }, [data, membershipData, query, sort, order, sourceType]);

  return {
    artists,
    error,
    updatedAt,
    isEmpty: artists.length === 0,
  };
};
