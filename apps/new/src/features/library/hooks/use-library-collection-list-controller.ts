import { useReducer } from "react";
import {
  type CollectionKind,
  useLibraryCollectionListQuery,
} from "./use-library-collection-list-query";
import {
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../services/library-collection-list-control-state-service";
import {
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
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
  const { collections, error, updatedAt } = useLibraryCollectionListQuery({
    kind,
    limit: null,
  });
  const listState = getLibraryCollectionListState({
    collections,
    emptyLabel,
    errors: getLibraryCollectionListErrors(error),
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
