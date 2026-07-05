import type { AddableCollectionSong } from "./addable-collection-songs-types-service";

export const normalizeAddableCollectionSongQuery = (query?: string) =>
  query?.trim().toLowerCase() ?? "";

export const matchesAddableCollectionSongQuery = (
  song: AddableCollectionSong,
  query: string,
) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value.toLowerCase().includes(query),
  );
};

export const compareAddableCollectionSongs = (
  first: AddableCollectionSong,
  second: AddableCollectionSong,
) => {
  if (first.isLinked !== second.isLinked) {
    return first.isLinked ? 1 : -1;
  }

  return first.title.localeCompare(second.title, undefined, {
    sensitivity: "base",
  });
};
