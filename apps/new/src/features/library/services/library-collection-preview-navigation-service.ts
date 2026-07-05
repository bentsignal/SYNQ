import type { LibraryCollectionPreview } from "./library-collection-preview-service";

export type LibraryCollectionPreviewHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export const getLibraryCollectionPreviewHref = (
  collection: Pick<LibraryCollectionPreview, "id" | "kind">,
): LibraryCollectionPreviewHref => {
  switch (collection.kind) {
    case "albums":
      return `/(tabs)/library/album/${collection.id}`;
    case "artists":
      return `/(tabs)/library/artist/${collection.id}`;
    case "playlists":
    default:
      return `/(tabs)/library/playlist/${collection.id}`;
  }
};

export const getLibraryCollectionPreviewRows = (
  collections: LibraryCollectionPreview[],
) =>
  collections.map((collection) => ({
    collection,
    href: getLibraryCollectionPreviewHref(collection),
  }));

export type LibraryCollectionPreviewRowState = ReturnType<
  typeof getLibraryCollectionPreviewRows
>[number];
