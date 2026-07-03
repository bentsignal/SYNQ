import { useMemo } from "react";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import { useLibrarySongDetailLiveQuery } from "../data/use-library-song-detail-live-query";
import {
  buildLibrarySongDetail,
  type LibrarySongDetailAlbumRow,
  type LibrarySongDetailArtistRow,
  type LibrarySongDetailLikedRow,
  type LibrarySongDetailPlaylistRow,
  type LibrarySongDetailSongRow,
} from "../services/library-song-detail-service";

export type { LibrarySongDetail } from "../services/library-song-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function useLibrarySongDetailQuery(songId: number) {
  const { albums, artists, liked, playlists, song } =
    useLibrarySongDetailLiveQuery(songId);
  const detail = useMemo(() => {
    return buildLibrarySongDetail({
      albumRows: (albums.data ?? []) as LibrarySongDetailAlbumRow[],
      artistRows: (artists.data ?? []) as LibrarySongDetailArtistRow[],
      getImagePath: getSmallImagePath,
      likedRows: (liked.data ?? []) as LibrarySongDetailLikedRow[],
      playlistRows: (playlists.data ?? []) as LibrarySongDetailPlaylistRow[],
      songRow: (song.data?.[0] ?? null) as LibrarySongDetailSongRow | null,
      updatedAt: Math.max(
        song.updatedAt?.getTime() ?? 0,
        artists.updatedAt?.getTime() ?? 0,
        albums.updatedAt?.getTime() ?? 0,
        playlists.updatedAt?.getTime() ?? 0,
        liked.updatedAt?.getTime() ?? 0,
      ),
    });
  }, [
    albums.data,
    albums.updatedAt,
    artists.data,
    artists.updatedAt,
    liked.data,
    liked.updatedAt,
    playlists.data,
    playlists.updatedAt,
    song.data,
    song.updatedAt,
  ]);

  return {
    detail,
    errors: [
      song.error,
      artists.error,
      albums.error,
      playlists.error,
      liked.error,
    ].filter(Boolean),
  };
}
