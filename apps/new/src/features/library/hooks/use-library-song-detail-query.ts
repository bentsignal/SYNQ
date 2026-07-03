import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibrarySongDetailLiveQuery } from "../data/use-library-song-detail-live-query";
import {
  type LibrarySongDetailAlbumRow,
  type LibrarySongDetailArtistRow,
  type LibrarySongDetailLikedRow,
  type LibrarySongDetailPlaylistRow,
  type LibrarySongDetailSongRow,
} from "../services/library-song-detail-service";
import { buildLibrarySongDetailQueryResult } from "../services/library-song-detail-query-result-service";

export type { LibrarySongDetail } from "../services/library-song-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function useLibrarySongDetailQuery(songId: number) {
  const { albums, artists, liked, playlists, song } =
    useLibrarySongDetailLiveQuery(songId);

  return useMemo(
    () =>
      buildLibrarySongDetailQueryResult({
        albumError: albums.error,
        albumRows: (albums.data ?? []) as LibrarySongDetailAlbumRow[],
        albumUpdatedAt: albums.updatedAt,
        artistError: artists.error,
        artistRows: (artists.data ?? []) as LibrarySongDetailArtistRow[],
        artistUpdatedAt: artists.updatedAt,
        getImagePath: getSmallImagePath,
        likedError: liked.error,
        likedRows: (liked.data ?? []) as LibrarySongDetailLikedRow[],
        likedUpdatedAt: liked.updatedAt,
        playlistError: playlists.error,
        playlistRows: (playlists.data ?? []) as LibrarySongDetailPlaylistRow[],
        playlistUpdatedAt: playlists.updatedAt,
        songError: song.error,
        songRow: (song.data?.[0] ?? null) as LibrarySongDetailSongRow | null,
        songUpdatedAt: song.updatedAt,
      }),
    [
      albums.data,
      albums.error,
      albums.updatedAt,
      artists.data,
      artists.error,
      artists.updatedAt,
      liked.data,
      liked.error,
      liked.updatedAt,
      playlists.data,
      playlists.error,
      playlists.updatedAt,
      song.data,
      song.error,
      song.updatedAt,
    ],
  );
}
