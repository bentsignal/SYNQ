import { useState } from "react";
import { SortOrder, SortType } from "@/src/constants/Types";

export const usePlaybackQueueFilterState = () => {
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const [query, setQuery] = useState<string>("");

  return {
    order,
    query,
    setOrder,
    setQuery,
    setSort,
    sort,
  };
};
