import {
  getLibraryCollectionPreviewHref,
  type LibraryCollectionPreview,
} from "./library-collection-preview-service";

export type LibraryCollectionListKind = "albums" | "artists" | "playlists";

export type LibraryCollectionListHref =
  | "/(tabs)/library"
  | "/(tabs)/library/album/create"
  | "/(tabs)/library/artist/create"
  | "/(tabs)/library/playlist/create";

export const getLibraryCollectionListBackHref =
  (): LibraryCollectionListHref => "/(tabs)/library";

export const getLibraryCollectionCreateHref = (
  kind: LibraryCollectionListKind,
): LibraryCollectionListHref => {
  switch (kind) {
    case "albums":
      return "/(tabs)/library/album/create";
    case "artists":
      return "/(tabs)/library/artist/create";
    case "playlists":
    default:
      return "/(tabs)/library/playlist/create";
  }
};

export const getLibraryCollectionListCopy = (
  kind: LibraryCollectionListKind,
) => {
  const shared = {
    backLink: {
      href: getLibraryCollectionListBackHref(),
      label: "Library",
    },
    createLink: {
      href: getLibraryCollectionCreateHref(kind),
      label: "Create",
    },
    kicker: "Library",
  };

  switch (kind) {
    case "albums":
      return {
        ...shared,
        empty: "No albums in library",
        placeholder: "Search albums or artists",
        title: "Albums",
      };
    case "artists":
      return {
        ...shared,
        empty: "No artists in library",
        placeholder: "Search artists",
        title: "Artists",
      };
    case "playlists":
    default:
      return {
        ...shared,
        empty: "No playlists in library",
        placeholder: "Search playlists",
        title: "Playlists",
      };
  }
};

export type LibraryCollectionListCopy = ReturnType<
  typeof getLibraryCollectionListCopy
>;

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const collectionMatchesQuery = (
  collection: LibraryCollectionPreview,
  query: string,
) => {
  if (!query) {
    return true;
  }

  return [collection.title, collection.meta, collection.detail].some((value) =>
    value.toLowerCase().includes(query),
  );
};

export const filterCollectionPreviews = ({
  collections,
  query,
}: {
  collections: LibraryCollectionPreview[];
  query?: string;
}) => {
  const normalizedQuery = normalizeQuery(query);

  return collections.filter((collection) =>
    collectionMatchesQuery(collection, normalizedQuery),
  );
};

export const getLibraryCollectionListErrors = (error: unknown) =>
  error ? [error] : [];

export const getLibraryCollectionListState = ({
  collections,
  emptyLabel,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  query,
  updatedAt,
}: {
  collections: LibraryCollectionPreview[];
  emptyLabel: string;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  query?: string;
  updatedAt: number;
}) => {
  const normalizedQuery = normalizeQuery(query);
  const visibleCollections = collections.filter((collection) =>
    collectionMatchesQuery(collection, normalizedQuery),
  );
  const hasErrors = errors.length > 0;

  return {
    emptyLabel: normalizedQuery ? "No matching collections" : emptyLabel,
    hasErrors,
    statusLabel: hasErrors
      ? "One or more collection queries failed."
      : updatedAt > 0
        ? `Updated ${formatUpdatedAt(updatedAt)}`
        : "Waiting for library data",
    visibleCollections,
    visibleRows: visibleCollections.map((collection) => ({
      collection,
      href: getLibraryCollectionPreviewHref(collection),
    })),
  };
};

export type LibraryCollectionListState = ReturnType<
  typeof getLibraryCollectionListState
>;

export const getLibraryCollectionListControllerViewState = ({
  collections,
  error,
  kind,
  query,
  updatedAt,
}: {
  collections: LibraryCollectionPreview[];
  error: unknown;
  kind: LibraryCollectionListKind;
  query: string;
  updatedAt: number;
}) => {
  const copy = getLibraryCollectionListCopy(kind);

  return {
    copy,
    listState: getLibraryCollectionListState({
      collections,
      emptyLabel: copy.empty,
      errors: getLibraryCollectionListErrors(error),
      query,
      updatedAt,
    }),
  };
};

export type LibraryCollectionListControllerViewState = ReturnType<
  typeof getLibraryCollectionListControllerViewState
>;
