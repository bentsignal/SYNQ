import type { LibraryCollectionListKind } from "./library-collection-list-service";
import { getLibraryCollectionCreateHref } from "./library-collection-list-service";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-service";

export type LibraryHomeHref =
  | "/(tabs)/import"
  | ReturnType<typeof getLibraryCollectionCreateHref>;

export type LibraryHomeHeaderAction = {
  href: LibraryHomeHref;
  label: string;
};

export type LibraryHomeStatusState = {
  hasErrors: boolean;
  isError: boolean;
  statusLabel: string;
};

export type LibraryHomeControlState = {
  order: LibrarySongPreviewOrder;
  query: string;
  sort: LibrarySongPreviewSort;
};

export type LibraryHomeControlAction =
  | {
      query: string;
      type: "set-query";
    }
  | {
      sort: LibrarySongPreviewSort;
      type: "set-sort";
    }
  | {
      order: LibrarySongPreviewOrder;
      type: "set-order";
    };

export const initialLibraryHomeControlState: LibraryHomeControlState = {
  order: "desc",
  query: "",
  sort: "recent",
};

export const getLibraryHomeSetQueryAction = (
  query: string,
): LibraryHomeControlAction => ({
  query,
  type: "set-query",
});

export const getLibraryHomeSetSortAction = (
  sort: LibrarySongPreviewSort,
): LibraryHomeControlAction => ({
  sort,
  type: "set-sort",
});

export const getLibraryHomeSetOrderAction = (
  order: LibrarySongPreviewOrder,
): LibraryHomeControlAction => ({
  order,
  type: "set-order",
});

export const libraryHomeControlReducer = (
  state: LibraryHomeControlState,
  action: LibraryHomeControlAction,
): LibraryHomeControlState => {
  switch (action.type) {
    case "set-query":
      return {
        ...state,
        query: action.query,
      };
    case "set-sort":
      return {
        ...state,
        sort: action.sort,
      };
    case "set-order":
      return {
        ...state,
        order: action.order,
      };
  }
};

const createCollectionAction = ({
  kind,
  label,
}: {
  kind: LibraryCollectionListKind;
  label: string;
}): LibraryHomeHeaderAction => ({
  href: getLibraryCollectionCreateHref(kind),
  label,
});

export const getLibraryHomeImportHref = (): LibraryHomeHref =>
  "/(tabs)/import";

export const getLibraryHomeHeaderActions = (): LibraryHomeHeaderAction[] => [
  {
    href: getLibraryHomeImportHref(),
    label: "Import music",
  },
  createCollectionAction({
    kind: "playlists",
    label: "Create playlist",
  }),
  createCollectionAction({
    kind: "albums",
    label: "Create album",
  }),
  createCollectionAction({
    kind: "artists",
    label: "Create artist",
  }),
];

export const getLibraryHomeHeaderState = () => ({
  actions: getLibraryHomeHeaderActions(),
  kicker: "Music Library",
  subtitle:
    "Browse your songs, playlists, albums, and artists as your collection grows.",
  title: "Library",
});

export const getLibraryHomeQueryErrors = ({
  collectionErrors,
  songError,
  summaryErrors,
}: {
  collectionErrors: readonly unknown[];
  songError: unknown;
  summaryErrors: readonly unknown[];
}) => [
  ...summaryErrors,
  ...collectionErrors,
  ...(songError ? [songError] : []),
];

export const getLibraryHomeStatusState = ({
  collectionUpdatedAt,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  songUpdatedAt,
  summaryUpdatedAt,
}: {
  collectionUpdatedAt: number;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  songUpdatedAt: number;
  summaryUpdatedAt: number;
}): LibraryHomeStatusState => {
  const hasErrors = errors.length > 0;
  const latestUpdate = Math.max(
    summaryUpdatedAt,
    collectionUpdatedAt,
    songUpdatedAt,
  );

  return {
    hasErrors,
    isError: hasErrors,
    statusLabel: hasErrors
      ? "One or more library queries failed."
      : latestUpdate > 0
        ? `Updated ${formatUpdatedAt(latestUpdate)}`
        : "Waiting for library data",
  };
};
