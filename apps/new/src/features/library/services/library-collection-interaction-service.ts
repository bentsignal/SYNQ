import type { AddableCollectionSong } from "./addable-collection-songs-service";
import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

export const getPlayableCollectionSongs = (
  songs: LibraryCollectionDetailSong[],
) => songs.filter((song) => song.pathToFile !== null);

export const reorderCollectionSongs = ({
  direction,
  songId,
  songs,
}: {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) => {
  const fromIndex = songs.findIndex((song) => song.id === songId);

  if (fromIndex < 0) {
    return songs;
  }

  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

  if (toIndex < 0 || toIndex >= songs.length) {
    return songs;
  }

  const nextSongs = [...songs];
  const [movedSong] = nextSongs.splice(fromIndex, 1);
  nextSongs.splice(toIndex, 0, movedSong);

  return nextSongs;
};

export const getSelectedAddableSongIds = ({
  selectedSongIds,
  songs,
}: {
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) =>
  Array.from(selectedSongIds).filter((songId) =>
    songs.some((song) => song.id === songId && !song.isLinked),
  );

export const toggleSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);

  if (nextSelection.has(songId)) {
    nextSelection.delete(songId);
  } else {
    nextSelection.add(songId);
  }

  return nextSelection;
};

export const removeSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);
  nextSelection.delete(songId);

  return nextSelection;
};
