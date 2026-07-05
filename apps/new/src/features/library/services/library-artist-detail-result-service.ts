import {
  buildArtistDetail,
} from "./library-collection-detail-service";
import {
  buildLibraryCollectionDetailResult,
} from "./library-collection-detail-result-builder-service";
import type {
  ArtistDetailResultParams,
  LibraryCollectionDetailResult,
} from "./library-collection-detail-result-types-service";
import {
  getCollectionDetailResultUpdatedAt,
} from "./library-collection-detail-result-metadata-service";

export const buildArtistDetailResult = ({
  artistRows,
  artistUpdatedAt,
  collectionError,
  getImagePath,
  songRows,
  songsError,
  songsUpdatedAt,
}: ArtistDetailResultParams): LibraryCollectionDetailResult =>
  buildLibraryCollectionDetailResult({
    detail: buildArtistDetail({
      artistRows,
      getImagePath,
      songRows,
      updatedAt: getCollectionDetailResultUpdatedAt(
        artistUpdatedAt,
        songsUpdatedAt,
      ),
    }),
    metadata: {
      collectionError,
      songsError,
      songsUpdatedAt,
    },
  });
