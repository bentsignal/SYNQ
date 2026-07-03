import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildLibrarySongDetailAlbumRowsQuery,
  buildLibrarySongDetailArtistRowsQuery,
  buildLibrarySongDetailPlaylistRowsQuery,
  buildLibrarySongDetailRowsQuery,
} from "../repository/library-song-detail-query-repository";
import {
  buildLibrarySongDetail,
  type LibrarySongDetailAlbumRow,
  type LibrarySongDetailArtistRow,
  type LibrarySongDetailPlaylistRow,
  type LibrarySongDetailSongRow,
} from "../services/library-song-detail-service";

export type { LibrarySongDetail } from "../services/library-song-detail-service";

export function useLibrarySongDetailQuery(songId: number) {
  const song = useLiveQuery(buildLibrarySongDetailRowsQuery(songId));
  const artists = useLiveQuery(buildLibrarySongDetailArtistRowsQuery(songId));
  const albums = useLiveQuery(buildLibrarySongDetailAlbumRowsQuery(songId));
  const playlists = useLiveQuery(buildLibrarySongDetailPlaylistRowsQuery(songId));
  const detail = useMemo(() => {
    return buildLibrarySongDetail({
      albumRows: (albums.data ?? []) as LibrarySongDetailAlbumRow[],
      artistRows: (artists.data ?? []) as LibrarySongDetailArtistRow[],
      likedRows: [],
      playlistRows: (playlists.data ?? []) as LibrarySongDetailPlaylistRow[],
      songRow: (song.data?.[0] ?? null) as LibrarySongDetailSongRow | null,
      updatedAt: Math.max(
        song.updatedAt?.getTime() ?? 0,
        artists.updatedAt?.getTime() ?? 0,
        albums.updatedAt?.getTime() ?? 0,
        playlists.updatedAt?.getTime() ?? 0,
      ),
    });
  }, [
    albums.data,
    albums.updatedAt,
    artists.data,
    artists.updatedAt,
    playlists.data,
    playlists.updatedAt,
    song.data,
    song.updatedAt,
  ]);

  return {
    detail,
    errors: [song.error, artists.error, albums.error, playlists.error].filter(
      Boolean,
    ),
  };
}
