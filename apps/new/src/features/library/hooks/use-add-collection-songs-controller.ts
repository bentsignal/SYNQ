import { useCallback, useMemo, useState } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { AddableCollectionSong } from "../services/addable-collection-songs-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-detail-service";
import {
  addSongToCollection,
  addSongsToCollection,
} from "../repository/relationship-repository";
import {
  getAddableSongSelectionState,
  removeSongIdSelection,
  toggleSongIdSelection,
} from "../services/library-collection-interaction-service";

export function useAddCollectionSongsController({
  collectionId,
  kind,
  songs,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songs: AddableCollectionSong[];
}) {
  const { sendHaptic } = useHapticFeedback();
  const [savingSongId, setSavingSongId] = useState<number | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isAddingSelection, setIsAddingSelection] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const selectionState = useMemo(
    () =>
      getAddableSongSelectionState({
        isAddingSelection,
        savingSongId,
        songs,
        selectedSongIds,
      }),
    [isAddingSelection, savingSongId, selectedSongIds, songs],
  );

  const toggleSongSelection = useCallback(
    (songId: number) => {
      sendHaptic("light");
      setSelectedSongIds((currentSelection) =>
        toggleSongIdSelection({
          selectedSongIds: currentSelection,
          songId,
        }),
      );
    },
    [sendHaptic],
  );

  const addSelectedSongs = useCallback(async () => {
    if (!selectionState.canBulkAdd) {
      sendHaptic("error");
      return;
    }

    sendHaptic("medium");
    setIsAddingSelection(true);
    setMutationError(null);

    try {
      await addSongsToCollection({
        collectionId,
        kind,
        songIds: selectionState.selectedAddableSongIds,
      });
      setSelectedSongIds(new Set());
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Selected songs could not be added.",
      );
    } finally {
      setIsAddingSelection(false);
    }
  }, [collectionId, kind, selectionState, sendHaptic]);

  const addSong = useCallback(
    async (songId: number) => {
      sendHaptic("light");
      setSavingSongId(songId);
      setMutationError(null);

      try {
        await addSongToCollection({
          collectionId,
          kind,
          songId,
        });
        setSelectedSongIds((currentSelection) =>
          removeSongIdSelection({
            selectedSongIds: currentSelection,
            songId,
          }),
        );
        sendHaptic("success");
      } catch (caughtError) {
        sendHaptic("error");
        setMutationError(
          caughtError instanceof Error
            ? caughtError.message
            : "Song could not be added.",
        );
      } finally {
        setSavingSongId(null);
      }
    },
    [collectionId, kind, sendHaptic],
  );

  return {
    addSelectedSongs,
    addSong,
    mutationError,
    savingSongId,
    selectedSongIds,
    selectionState,
    toggleSongSelection,
  };
}
