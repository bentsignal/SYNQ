import type { LibraryCollectionPreview } from "./library-collection-preview-service";

export type CollectionPreviewGroup = {
  albums: LibraryCollectionPreview[];
  artists: LibraryCollectionPreview[];
  playlists: LibraryCollectionPreview[];
};

export const isLibraryCollectionPreviewGroupEmpty = (
  collections: CollectionPreviewGroup,
) =>
  collections.albums.length === 0 &&
  collections.artists.length === 0 &&
  collections.playlists.length === 0;
