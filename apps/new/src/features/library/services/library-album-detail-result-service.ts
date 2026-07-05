import {
  buildAlbumDetail,
} from "./library-collection-detail-service";
import {
  buildLibraryCollectionDetailResult,
} from "./library-collection-detail-result-builder-service";
import type {
  AlbumDetailResultParams,
  LibraryCollectionDetailResult,
} from "./library-collection-detail-result-types-service";
import {
  getCollectionDetailResultUpdatedAt,
} from "./library-collection-detail-result-metadata-service";

export const buildAlbumDetailResult = ({
  albumRows,
  albumUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: AlbumDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildAlbumDetail({
      albumRows,
      getImagePath,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        albumUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });
