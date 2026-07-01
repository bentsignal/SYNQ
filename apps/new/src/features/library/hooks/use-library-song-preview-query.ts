import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type SongPreviewRow = {
  songId: number;
  title: string;
  artistName: string | null;
  albumName: string | null;
  duration: number | null;
};

type SongPreviewAccumulator = {
  albumNames: Set<string>;
  artistNames: Set<string>;
  duration: number | null;
  songId: number;
  title: string;
};

export type LibrarySongPreview = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  title: string;
};

const emptyLabel = "Unknown";

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return emptyLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const rowsToSongPreviews = (rows: SongPreviewRow[]) => {
  const songMap = new Map<number, SongPreviewAccumulator>();

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        songId: row.songId,
        title: row.title,
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
    .map<LibrarySongPreview>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.songId,
      title: song.title,
    }))
    .sort((first, second) => second.id - first.id)
    .slice(0, 12);
};

export function useLibrarySongPreviewQuery() {
  const { data, error, updatedAt } = useLiveQuery(
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

  const songs = useMemo(
    () => rowsToSongPreviews((data ?? []) as SongPreviewRow[]),
    [data],
  );

  return {
    error,
    isEmpty: songs.length === 0,
    songs,
    updatedAt,
  };
}
