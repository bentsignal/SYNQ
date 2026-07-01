import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import type { LibraryCollectionDetailKind } from "./use-library-collection-detail-query";

type AddableSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  songId: number;
  title: string | null;
};

type AddableSongAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  id: number;
  title: string;
};

export type AddableCollectionSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  isLinked: boolean;
  title: string;
};

const unknownLabel = "Unknown";

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return unknownLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const matchesQuery = (song: AddableCollectionSong, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

const buildSongs = ({
  linkedSongIds,
  query,
  rows,
}: {
  linkedSongIds: Set<number>;
  query?: string;
  rows: AddableSongRow[];
}) => {
  const songMap = new Map<number, AddableSongAccumulator>();
  const normalizedQuery = normalizeQuery(query);

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        id: row.songId,
        title: row.title ?? "Untitled song",
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    songMap.set(row.songId, song);
  });

  return Array.from(songMap.values())
    .map<AddableCollectionSong>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      isLinked: linkedSongIds.has(song.id),
      title: song.title,
    }))
    .filter((song) => matchesQuery(song, normalizedQuery))
    .sort((first, second) => {
      if (first.isLinked !== second.isLinked) {
        return first.isLinked ? 1 : -1;
      }

      return first.title.localeCompare(second.title, undefined, {
        sensitivity: "base",
      });
    })
    .slice(0, 100);
};

export function useAddableCollectionSongsQuery({
  collectionId,
  kind,
  query,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  query?: string;
}) {
  const songs = useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        songId: schema.songs.id,
        title: schema.songs.title,
      })
      .from(schema.songs)
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
      .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id)),
  );
  const playlistSongs = useLiveQuery(
    db
      .select({ songId: schema.playlistSongs.songId })
      .from(schema.playlistSongs)
      .where(eq(schema.playlistSongs.playlistId, collectionId)),
  );
  const albumSongs = useLiveQuery(
    db
      .select({ songId: schema.albumSongs.songId })
      .from(schema.albumSongs)
      .where(eq(schema.albumSongs.albumId, collectionId)),
  );
  const artistSongs = useLiveQuery(
    db
      .select({ songId: schema.artistSongs.songId })
      .from(schema.artistSongs)
      .where(eq(schema.artistSongs.artistId, collectionId)),
  );

  const linkedRows =
    kind === "album"
      ? albumSongs.data
      : kind === "artist"
        ? artistSongs.data
        : playlistSongs.data;

  const addableSongs = useMemo(() => {
    const linkedSongIds = new Set(
      (linkedRows ?? []).flatMap((row) =>
        row.songId === null ? [] : [row.songId],
      ),
    );

    return buildSongs({
      linkedSongIds,
      query,
      rows: (songs.data ?? []) as AddableSongRow[],
    });
  }, [linkedRows, query, songs.data]);

  return {
    errors: [
      songs.error,
      playlistSongs.error,
      albumSongs.error,
      artistSongs.error,
    ].filter(Boolean),
    songs: addableSongs,
    updatedAt: Math.max(
      songs.updatedAt?.getTime() ?? 0,
      playlistSongs.updatedAt?.getTime() ?? 0,
      albumSongs.updatedAt?.getTime() ?? 0,
      artistSongs.updatedAt?.getTime() ?? 0,
    ),
  };
}
