import { useState } from "react";
import { useLibraryCollectionPreviewQuery } from "./use-library-collection-preview-query";
import {
  useLibrarySongPreviewQuery,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewSort,
} from "./use-library-song-preview-query";
import { useLibrarySummaryQuery } from "./use-library-summary-query";
import { getLibraryHomeStatusState } from "../services/library-home-service";

export function useLibraryHomeController() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LibrarySongPreviewSort>("recent");
  const [order, setOrder] = useState<LibrarySongPreviewOrder>("desc");
  const summary = useLibrarySummaryQuery();
  const collectionPreview = useLibraryCollectionPreviewQuery();
  const songPreview = useLibrarySongPreviewQuery({ order, query, sort });
  const statusState = getLibraryHomeStatusState({
    collectionUpdatedAt: collectionPreview.updatedAt,
    errors: [
      ...summary.errors,
      ...collectionPreview.errors,
      ...(songPreview.error ? [songPreview.error] : []),
    ],
    songUpdatedAt: songPreview.updatedAt,
    summaryUpdatedAt: summary.updatedAt,
  });

  return {
    collectionPreview,
    order,
    query,
    setOrder,
    setQuery,
    setSort,
    songPreview,
    sort,
    statusState,
    summary,
  };
}

export type LibraryHomeController = ReturnType<typeof useLibraryHomeController>;
