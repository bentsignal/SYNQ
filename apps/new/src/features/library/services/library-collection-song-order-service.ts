import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

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

export const getCollectionSongOrderUpdate = ({
  direction,
  songId,
  songs,
}: {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) => ({
  songIds: reorderCollectionSongs({ direction, songId, songs }).map(
    (song) => song.id,
  ),
});
