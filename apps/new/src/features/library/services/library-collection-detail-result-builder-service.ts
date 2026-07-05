import type {
  LibraryCollectionDetailResult,
  LibraryCollectionDetailResultMetadataParams,
} from "./library-collection-detail-result-types-service";
import type { LibraryCollectionDetail } from "./library-collection-detail-service";
import {
  getCollectionDetailResultErrors,
} from "./library-collection-detail-result-metadata-service";

export const buildLibraryCollectionDetailResult = ({
  detail,
  metadata,
}: {
  detail: LibraryCollectionDetail;
  metadata: LibraryCollectionDetailResultMetadataParams;
}): LibraryCollectionDetailResult => ({
  detail,
  errors: getCollectionDetailResultErrors(
    metadata.collectionError,
    metadata.songsError,
  ),
});
