import {
  buildPlaylistDetail,
} from "./library-collection-detail-service";
import {
  buildLibraryCollectionDetailResult,
} from "./library-collection-detail-result-builder-service";
import type {
  LibraryCollectionDetailResult,
  PlaylistDetailResultParams,
} from "./library-collection-detail-result-types-service";
import {
  getCollectionDetailResultUpdatedAt,
} from "./library-collection-detail-result-metadata-service";

export const buildPlaylistDetailResult = ({
  collectionError,
  getImagePath,
  playlistRows,
  playlistUpdatedAt,
  songRows,
  songsError,
  songsUpdatedAt,
}: PlaylistDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildPlaylistDetail({
      getImagePath,
      playlistRows,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        playlistUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });
