import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";
import {
  getCollectionSongRowActionState,
} from "./library-collection-song-action-state-service";
import { getLibrarySongDetailHref } from "./library-song-navigation-service";

export {
  getCollectionSongListState,
  getCollectionSongRowActionState,
  type CollectionSongRowActionState,
} from "./library-collection-song-action-state-service";
export {
  getCollectionSongOrderUpdate,
  reorderCollectionSongs,
} from "./library-collection-song-order-service";

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
