import { useReducer } from "react";
import {
  type CollectionKind,
  useLibraryCollectionPreviewQuery,
} from "./use-library-collection-preview-query";
import {
  getLibraryCollectionListState,
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-service";

type UseLibraryCollectionListControllerParams = {
  emptyLabel: string;
  kind: CollectionKind;
};

export function useLibraryCollectionListController({
  emptyLabel,
  kind,
}: UseLibraryCollectionListControllerParams) {
  const [controls, dispatchControls] = useReducer(
    libraryCollectionListControlReducer,
    initialLibraryCollectionListControlState,
  );
  const { collections, errors, updatedAt } = useLibraryCollectionPreviewQuery({
    limit: null,
  });
  const listState = getLibraryCollectionListState({
    collections: collections[kind],
    emptyLabel,
    errors,
    query: controls.query,
    updatedAt,
  });

  const setQuery = (query: string) => {
    dispatchControls({ query, type: "set-query" });
  };

  return {
    listState,
    query: controls.query,
    setQuery,
  };
}
