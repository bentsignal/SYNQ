import type { AddableCollectionSong } from "./addable-collection-songs-service";
import type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import { likedSongsPlaylistId } from "./library-playlist-constants-service";

export type LibraryCollectionListHref =
  | "/(tabs)/library/albums"
  | "/(tabs)/library/artists"
  | "/(tabs)/library/playlists";

export const getCollectionListHref = (
  kind: LibraryCollectionDetailKind,
): LibraryCollectionListHref => {
  switch (kind) {
    case "album":
      return "/(tabs)/library/albums";
    case "artist":
      return "/(tabs)/library/artists";
    case "playlist":
    default:
      return "/(tabs)/library/playlists";
  }
};

export const canDeleteLibraryCollection = ({
  id,
  isMissing,
  kind,
}: {
  id: number;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
}) =>
  !isMissing && (kind !== "playlist" || (id !== 1 && id !== likedSongsPlaylistId));

export const getPlayableCollectionSongs = (
  songs: LibraryCollectionDetailSong[],
) => songs.filter((song) => song.pathToFile !== null);

export const getCollectionDetailActionState = ({
  id,
  isDeleting,
  isExporting,
  isMissing,
  kind,
  songs,
}: {
  id: number;
  isDeleting: boolean;
  isExporting: boolean;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  songs: LibraryCollectionDetailSong[];
}) => {
  const playableSongs = getPlayableCollectionSongs(songs);
  const hasPlayableSongs = playableSongs.length > 0;
  const canDeleteCollection = canDeleteLibraryCollection({
    id,
    isMissing,
    kind,
  });

  return {
    canDelete: canDeleteCollection && !isDeleting,
    canExport: hasPlayableSongs && !isExporting,
    canPlay: hasPlayableSongs,
    canQueue: hasPlayableSongs,
    deleteLabel: isDeleting ? "Deleting" : "Delete",
    exportLabel: isExporting ? "Exporting" : "Export",
    playableSongs,
  };
};

export type CollectionDetailActionState = ReturnType<
  typeof getCollectionDetailActionState
>;

export const getCollectionPlaybackPlan = ({
  playableSongs,
}: {
  playableSongs: LibraryCollectionDetailSong[];
}) => {
  const [firstSong, ...queuedSongs] = playableSongs;

  return {
    canStartPlayback: firstSong !== undefined,
    firstSong: firstSong ?? null,
    queuedSongs,
  };
};

export type CollectionPlaybackPlan = ReturnType<
  typeof getCollectionPlaybackPlan
>;

export type CollectionPlaybackCommandPlan = {
  firstSong: LibraryCollectionDetailSong | null;
  haptic: "error" | "light";
  playerHref: "/player" | null;
  queuedSongs: LibraryCollectionDetailSong[];
};

export const getCollectionPlaybackCommandPlan = ({
  playableSongs,
}: {
  playableSongs: LibraryCollectionDetailSong[];
}): CollectionPlaybackCommandPlan => {
  const playbackPlan = getCollectionPlaybackPlan({ playableSongs });

  if (!playbackPlan.canStartPlayback || !playbackPlan.firstSong) {
    return {
      firstSong: null,
      haptic: "error",
      playerHref: null,
      queuedSongs: [],
    };
  }

  return {
    firstSong: playbackPlan.firstSong,
    haptic: "light",
    playerHref: "/player",
    queuedSongs: playbackPlan.queuedSongs,
  };
};

export const getCollectionQueuePlan = ({
  canQueue,
  playableSongs,
}: {
  canQueue: boolean;
  playableSongs: LibraryCollectionDetailSong[];
}) => ({
  canQueue,
  queuedSongs: canQueue ? playableSongs : [],
});

export type CollectionQueuePlan = ReturnType<typeof getCollectionQueuePlan>;

export type CollectionQueueCommandPlan = {
  haptic: "error" | "light";
  queuedSongs: LibraryCollectionDetailSong[];
};

export const getCollectionQueueCommandPlan = ({
  canQueue,
  playableSongs,
}: {
  canQueue: boolean;
  playableSongs: LibraryCollectionDetailSong[];
}): CollectionQueueCommandPlan => {
  const queuePlan = getCollectionQueuePlan({ canQueue, playableSongs });

  return {
    haptic: queuePlan.canQueue ? "light" : "error",
    queuedSongs: queuePlan.queuedSongs,
  };
};

export type CollectionDetailMutationKind =
  | "delete-collection"
  | "export-collection"
  | "move-song"
  | "remove-song";

export const getCollectionDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: CollectionDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-collection":
      return "Collection could not be deleted.";
    case "export-collection":
      return "Songs could not be exported.";
    case "move-song":
      return "Song order could not be saved.";
    case "remove-song":
      return "Song could not be removed.";
  }
};

export const getDeleteCollectionConfirmationCopy = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => ({
  message: `Delete ${title}? Songs will stay in your library.`,
  title: `Delete ${eyebrow.toLowerCase()}`,
});

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
  index,
  movingSongId,
  removingSongId,
  songId,
  totalSongs,
}: {
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
    canMoveDown: !isMutating && index < totalSongs - 1,
    canMoveUp: !isMutating && index > 0,
    canRemove: !isMutating,
    downLabel: isMoving ? "Moving" : "Down",
    isMoving,
    isRemoving,
    removeLabel: isRemoving ? "Removing" : "Remove",
    upLabel: isMoving ? "Moving" : "Up",
  };
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

export const getAddableSongSelectionState = ({
  isAddingSelection,
  savingSongId,
  selectedSongIds,
  songs,
}: {
  isAddingSelection: boolean;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) => {
  const selectedAddableSongIds = getSelectedAddableSongIds({
    selectedSongIds,
    songs,
  });
  const selectedCount = selectedAddableSongIds.length;
  const isMutating = isAddingSelection || savingSongId !== null;

  return {
    bulkAddLabel: isAddingSelection ? "Adding" : "Add selected",
    canBulkAdd: selectedCount > 0 && !isMutating,
    isMutating,
    selectedAddableSongIds,
    selectedCount,
    selectionLabel:
      selectedCount === 0
        ? "Select songs to add several at once."
        : `${selectedCount} selected`,
  };
};

export type AddableSongSelectionState = ReturnType<
  typeof getAddableSongSelectionState
>;

export type AddCollectionSongsMutationKind = "add-selection" | "add-song";

export const getAddCollectionSongsMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: AddCollectionSongsMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "add-selection":
      return "Selected songs could not be added.";
    case "add-song":
      return "Song could not be added.";
  }
};

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

export const getAddableSongRowState = ({
  savingSongId,
  selectedSongIds,
  song,
}: {
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  song: AddableCollectionSong;
}) => {
  const isSaving = savingSongId === song.id;
  const isDisabled = song.isLinked || isSaving;
  const isSelected = selectedSongIds.has(song.id) && !song.isLinked;

  return {
    addLabel: song.isLinked ? "Added" : isSaving ? "Adding" : "Add",
    isDisabled,
    isSaving,
    isSelected,
  };
};
