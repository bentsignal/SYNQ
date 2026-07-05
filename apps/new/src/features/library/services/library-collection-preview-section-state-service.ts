import { getLibraryCollectionPreviewRows } from "./library-collection-preview-navigation-service";
import type {
  LibraryCollectionPreview,
  LibraryCollectionPreviewCollections,
  LibraryCollectionPreviewColumnKey,
  LibraryCollectionPreviewTotals,
} from "./library-collection-preview-service";

export const getLibraryCollectionPreviewEmptyState = () => ({
  body: "Create a playlist, album, or artist once you have songs to organize.",
  title: "No collections yet",
});

const previewColumnConfigs: {
  key: LibraryCollectionPreviewColumnKey;
  title: string;
  viewAllHref:
    | "/(tabs)/library/albums"
    | "/(tabs)/library/artists"
    | "/(tabs)/library/playlists";
}[] = [
  {
    key: "playlists",
    title: "Playlists",
    viewAllHref: "/(tabs)/library/playlists",
  },
  {
    key: "albums",
    title: "Albums",
    viewAllHref: "/(tabs)/library/albums",
  },
  {
    key: "artists",
    title: "Artists",
    viewAllHref: "/(tabs)/library/artists",
  },
];

export const getLibraryCollectionPreviewColumnsState = ({
  collections,
  totals,
}: {
  collections: LibraryCollectionPreviewCollections;
  totals: LibraryCollectionPreviewTotals;
}) =>
  previewColumnConfigs.map((column) => ({
    key: column.key,
    rows: getLibraryCollectionPreviewRows(collections[column.key]),
    title: column.title,
    total: totals[column.key],
    viewAllHref: column.viewAllHref,
  }));

export type LibraryCollectionPreviewColumnState = ReturnType<
  typeof getLibraryCollectionPreviewColumnsState
>[number];

export const getLibraryCollectionPreviewSectionState = ({
  collections,
  totals,
}: {
  collections: LibraryCollectionPreviewCollections;
  totals: LibraryCollectionPreviewTotals;
}) => ({
  columns: getLibraryCollectionPreviewColumnsState({ collections, totals }),
  emptyState: getLibraryCollectionPreviewEmptyState(),
});

export type LibraryCollectionPreviewSectionState = ReturnType<
  typeof getLibraryCollectionPreviewSectionState
>;

export type { LibraryCollectionPreview };
