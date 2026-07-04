import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";
import { getLibrarySongDetailHref } from "./library-song-interaction-service";

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

export const getCollectionSongListState = ({
  movingSongId,
  removingSongId,
}: {
  movingSongId: number | null;
  removingSongId: number | null;
}) => ({
  isMutating: movingSongId !== null || removingSongId !== null,
});

export const getCollectionSongRowActionState = ({
  canMutateSongs = true,
  index,
  movingSongId,
  removingSongId,
  songId,
  totalSongs,
}: {
  canMutateSongs?: boolean;
  index: number;
  movingSongId: number | null;
  removingSongId: number | null;
  songId: number;
  totalSongs: number;
}) => {
  const { isMutating } = getCollectionSongListState({
    movingSongId,
    removingSongId,
  });
  const isMoving = movingSongId === songId;
  const isRemoving = removingSongId === songId;

  return {
    canMoveDown: canMutateSongs && !isMutating && index < totalSongs - 1,
    canMoveUp: canMutateSongs && !isMutating && index > 0,
    canRemove: canMutateSongs && !isMutating,
    downLabel: isMoving ? "Moving" : "Down",
    isMoving,
    isRemoving,
    removeLabel: isRemoving ? "Removing" : "Remove",
    upLabel: isMoving ? "Moving" : "Up",
  };
};

export type CollectionSongRowActionState = ReturnType<
  typeof getCollectionSongRowActionState
>;

export const getCollectionSongRowViewState = ({
  canMutateSongs,
  index,
  movingSongId,
  removingSongId,
  songId,
  totalSongs,
}: {
  canMutateSongs?: boolean;
  index: number;
  movingSongId: number | null;
  removingSongId: number | null;
  songId: number;
  totalSongs: number;
}) => ({
  detailHref: getLibrarySongDetailHref({ songId }),
  rowState: getCollectionSongRowActionState({
    canMutateSongs,
    index,
    movingSongId,
    removingSongId,
    songId,
    totalSongs,
  }),
});
