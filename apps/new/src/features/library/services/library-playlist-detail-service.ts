import {
  rowsToCollectionDetailSongs,
  type LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
import {
  formatCollectionDetailCount,
  type CollectionImagePathResolver,
  type LibraryCollectionDetail,
} from "./library-collection-detail-shared-service";

export type PlaylistDetailRow = {
  coverImage: string | null;
  name: string | null;
};

export const buildPlaylistDetail = ({
  getImagePath,
  playlistRows,
  songRows,
  updatedAt,
}: {
  getImagePath?: CollectionImagePathResolver;
  playlistRows: PlaylistDetailRow[];
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const songs = rowsToCollectionDetailSongs(songRows);
  const playlist = playlistRows[0];

  return {
    detail: formatCollectionDetailCount(songs.length, "song"),
    eyebrow: "Playlist",
    imagePath: playlist?.coverImage
      ? getImagePath?.(playlist.coverImage) ?? null
      : null,
    isMissing: !playlist,
    kind: "playlist",
    meta: "Manual collection",
    songs,
    title: playlist?.name ?? "Playlist not found",
    updatedAt,
  };
};
