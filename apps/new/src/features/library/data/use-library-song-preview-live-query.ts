import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { buildLibrarySongPreviewRowsQuery } from "../repository/library-song-preview-query-repository";

export function useLibrarySongPreviewLiveQuery() {
  return useLiveQuery(buildLibrarySongPreviewRowsQuery());
}
