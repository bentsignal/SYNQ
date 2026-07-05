export type CollectionKind = "albums" | "artists" | "playlists";

export type LibraryCollectionPreview = {
  detail: string;
  id: number;
  imagePath: string | null;
  kind: CollectionKind;
  meta: string;
  title: string;
};

export {
  getLibraryCollectionPreviewHref,
  getLibraryCollectionPreviewRows,
  type LibraryCollectionPreviewHref,
  type LibraryCollectionPreviewRowState,
} from "./library-collection-preview-navigation-service";

export type LibraryCollectionPreviewColumnKey = CollectionKind;

export type LibraryCollectionPreviewCollections = Record<
  LibraryCollectionPreviewColumnKey,
  LibraryCollectionPreview[]
>;

export type LibraryCollectionPreviewTotals = Record<
  LibraryCollectionPreviewColumnKey,
  number
>;

export {
  getLibraryCollectionPreviewColumnsState,
  getLibraryCollectionPreviewEmptyState,
  getLibraryCollectionPreviewSectionState,
  type LibraryCollectionPreviewColumnState,
  type LibraryCollectionPreviewSectionState,
} from "./library-collection-preview-section-state-service";
