import type { LibraryCollectionPreview } from "./library-collection-preview-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
} from "./library-collection-list-state-service";
import {
  getLibraryCollectionListCopy,
  type LibraryCollectionListKind,
} from "./library-collection-list-copy-service";

export {
  getLibraryCollectionCreateHref,
  getLibraryCollectionListBackHref,
  getLibraryCollectionListCopy,
  type LibraryCollectionListCopy,
  type LibraryCollectionListHref,
  type LibraryCollectionListKind,
} from "./library-collection-list-copy-service";
export {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
  getLibraryCollectionListStatusLabel,
  type LibraryCollectionListState,
} from "./library-collection-list-state-service";
export { filterCollectionPreviews } from "./library-collection-list-search-service";

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
