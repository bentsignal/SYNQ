import { useState } from "react";
import { SortOrder, SortType } from "@/src/constants/Types";

type LibraryListQueryStateOptions = {
  initialOrder?: SortOrder;
  initialSort: SortType;
};

export function useLibraryListQueryState({
  initialOrder = SortOrder.DESC,
  initialSort,
}: LibraryListQueryStateOptions) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(initialSort);
  const [order, setOrder] = useState<SortOrder>(initialOrder);

  return {
    order,
    query,
    setOrder,
    setQuery,
    setSort,
    sort,
  };
}
