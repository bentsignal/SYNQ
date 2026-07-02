import { useState } from "react";
import {
  type CollectionKind,
  useLibraryCollectionPreviewQuery,
} from "./use-library-collection-preview-query";
import { getLibraryCollectionListState } from "../services/library-collection-list-service";

type UseLibraryCollectionListControllerParams = {
  emptyLabel: string;
  kind: CollectionKind;
};

export function useLibraryCollectionListController({
  emptyLabel,
  kind,
}: UseLibraryCollectionListControllerParams) {
  const [query, setQuery] = useState("");
  const { collections, errors, updatedAt } = useLibraryCollectionPreviewQuery({
    limit: null,
  });
  const listState = getLibraryCollectionListState({
    collections: collections[kind],
    emptyLabel,
    errors,
    query,
    updatedAt,
  });

  return {
    listState,
    query,
    setQuery,
  };
}
