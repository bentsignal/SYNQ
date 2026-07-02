import { useState } from "react";

export function useAddCollectionSongsSearchQuery() {
  const [query, setQuery] = useState("");

  return {
    query,
    setQuery,
  };
}
