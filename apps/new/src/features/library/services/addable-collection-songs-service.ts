import type {
  AddableCollectionLinkedSongRow,
} from "./addable-collection-songs-types-service";

export type {
  AddableCollectionLinkedSongRow,
  AddableCollectionSong,
  AddableCollectionSongRow,
} from "./addable-collection-songs-types-service";
export {
  compareAddableCollectionSongs,
  matchesAddableCollectionSongQuery,
  normalizeAddableCollectionSongQuery,
} from "./addable-collection-songs-filter-service";
export { rowsToAddableCollectionSongs } from "./addable-collection-songs-mapper-service";

export const rowsToLinkedSongIds = (
  rows: readonly AddableCollectionLinkedSongRow[] = [],
) =>
  new Set(
    rows.flatMap((row) => (row.songId === null ? [] : [row.songId])),
  );
