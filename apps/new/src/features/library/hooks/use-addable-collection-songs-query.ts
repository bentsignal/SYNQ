import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  rowsToAddableCollectionSongs,
  type AddableCollectionSongRow,
} from "../services/addable-collection-songs-service";

export type { AddableCollectionSong } from "../services/addable-collection-songs-service";

type LinkedSongRow = {
  songId: number | null;
};

function useAllAddableSongRowsQuery() {
  return useLiveQuery(
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
}

function usePlaylistLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(
    db
      .select({ songId: schema.playlistSongs.songId })
      .from(schema.playlistSongs)
      .where(eq(schema.playlistSongs.playlistId, collectionId)),
  );
}

function useAlbumLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(
    db
      .select({ songId: schema.albumSongs.songId })
      .from(schema.albumSongs)
      .where(eq(schema.albumSongs.albumId, collectionId)),
  );
}

function useArtistLinkedSongRowsQuery(collectionId: number) {
  return useLiveQuery(
    db
      .select({ songId: schema.artistSongs.songId })
      .from(schema.artistSongs)
      .where(eq(schema.artistSongs.artistId, collectionId)),
  );
}

function useAddableCollectionSongsResult({
  linkedRows,
  linkedRowsError,
  linkedRowsUpdatedAt,
  query,
  songRows,
}: {
  linkedRows: LinkedSongRow[] | undefined;
  linkedRowsError: Error | undefined;
  linkedRowsUpdatedAt: Date | undefined;
  query?: string;
  songRows: ReturnType<typeof useAllAddableSongRowsQuery>;
}) {
  const addableSongs = useMemo(() => {
    const linkedSongIds = new Set(
      (linkedRows ?? []).flatMap((row) =>
        row.songId === null ? [] : [row.songId],
      ),
    );

    return rowsToAddableCollectionSongs({
      linkedSongIds,
      query,
      rows: (songRows.data ?? []) as AddableCollectionSongRow[],
    });
  }, [linkedRows, query, songRows.data]);

  return {
    errors: [songRows.error, linkedRowsError].filter(Boolean),
    songs: addableSongs,
    updatedAt: Math.max(
      songRows.updatedAt?.getTime() ?? 0,
      linkedRowsUpdatedAt?.getTime() ?? 0,
    ),
  };
}

export function useAddableAlbumCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = useAlbumLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.data,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export function useAddableArtistCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = useArtistLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.data,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export function useAddablePlaylistCollectionSongsQuery({
  collectionId,
  query,
}: {
  collectionId: number;
  query?: string;
}) {
  const songRows = useAllAddableSongRowsQuery();
  const linkedRows = usePlaylistLinkedSongRowsQuery(collectionId);

  return useAddableCollectionSongsResult({
    linkedRows: linkedRows.data,
    linkedRowsError: linkedRows.error,
    linkedRowsUpdatedAt: linkedRows.updatedAt,
    query,
    songRows,
  });
}

export type AddableCollectionSongsQueryResult = ReturnType<
  typeof useAddableAlbumCollectionSongsQuery
>;
