import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";
import { getLibrarySongDetailHref } from "./library-song-navigation-service";

export {
  getCollectionSongOrderUpdate,
  reorderCollectionSongs,
} from "./library-collection-song-order-service";

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

export type CollectionSongRowViewState = ReturnType<
  typeof getCollectionSongRowViewState
>;

export const getCollectionSongRowsViewState = ({
  canMutateSongs,
  movingSongId,
  removingSongId,
  songs,
}: {
  canMutateSongs?: boolean;
  movingSongId: number | null;
  removingSongId: number | null;
  songs: LibraryCollectionDetailSong[];
}) =>
  songs.map((song, index) => ({
    song,
    viewState: getCollectionSongRowViewState({
      canMutateSongs,
      index,
      movingSongId,
      removingSongId,
      songId: song.id,
      totalSongs: songs.length,
    }),
  }));

export type CollectionSongRowViewModel = ReturnType<
  typeof getCollectionSongRowsViewState
>[number];
