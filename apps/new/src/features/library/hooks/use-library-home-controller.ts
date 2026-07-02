import { useState } from "react";
import { useLibraryCollectionPreviewQuery } from "./use-library-collection-preview-query";
import {
  useLibrarySongPreviewQuery,
  type LibrarySongPreviewOrder,
  type LibrarySongPreviewSort,
} from "./use-library-song-preview-query";
import { useLibrarySummaryQuery } from "./use-library-summary-query";

export function useLibraryHomeController() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LibrarySongPreviewSort>("recent");
  const [order, setOrder] = useState<LibrarySongPreviewOrder>("desc");
  const summary = useLibrarySummaryQuery();
  const collectionPreview = useLibraryCollectionPreviewQuery();
  const songPreview = useLibrarySongPreviewQuery({ order, query, sort });
  const hasErrors =
    summary.errors.length > 0 ||
    collectionPreview.errors.length > 0 ||
    Boolean(songPreview.error);
  const latestUpdate = Math.max(
    summary.updatedAt,
    collectionPreview.updatedAt,
    songPreview.updatedAt?.getTime() ?? 0,
  );
  const updatedLabel =
    latestUpdate > 0
      ? `Updated ${new Date(latestUpdate).toLocaleTimeString()}`
      : "Waiting for library data";

  return {
    collectionPreview,
    hasErrors,
    order,
    query,
    setOrder,
    setQuery,
    setSort,
    songPreview,
    sort,
    summary,
    updatedLabel,
  };
}

export type LibraryHomeController = ReturnType<typeof useLibraryHomeController>;
