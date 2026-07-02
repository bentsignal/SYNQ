import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteCollection } from "../repository/collection-delete-repository";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import {
  getCollectionDetailActionState,
  getCollectionListHref,
  reorderCollectionSongs,
} from "../services/library-collection-interaction-service";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";

type UseLibraryCollectionDetailControllerParams = {
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionDetailController({
  detail,
  id,
  kind,
}: UseLibraryCollectionDetailControllerParams) {
  const { addToQueue, playSong } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();
  const [movingSongId, setMovingSongId] = useState<number | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const actionState = useMemo(
    () =>
      getCollectionDetailActionState({
        id,
        isDeleting,
        isExporting,
        isMissing: detail.isMissing,
        kind,
        songs: detail.songs,
      }),
    [detail.isMissing, detail.songs, id, isDeleting, isExporting, kind],
  );

  const playCollection = () => {
    const [firstSong, ...queuedSongs] = actionState.playableSongs;

    if (!firstSong) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    playSong(firstSong);
    queuedSongs.forEach(addToQueue);
    router.push("/player");
  };

  const queueCollection = () => {
    if (!actionState.canQueue) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    actionState.playableSongs.forEach(addToQueue);
  };

  const exportCollection = async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    setIsExporting(true);
    setMutationError(null);

    try {
      await shareLibrarySongs(actionState.playableSongs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Songs could not be exported.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const deleteCurrentCollection = () => {
    if (!actionState.canDelete) {
      sendHaptic("error");
      return;
    }

    Alert.alert(
      `Delete ${detail.eyebrow.toLowerCase()}`,
      `Delete ${detail.title}? Songs will stay in your library.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setIsDeleting(true);
            setMutationError(null);

            try {
              await deleteCollection({ id, kind });
              sendHaptic("success");
              router.replace(getCollectionListHref(kind));
            } catch (caughtError) {
              sendHaptic("error");
              setMutationError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Collection could not be deleted.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const moveSong = async (songId: number, direction: "down" | "up") => {
    setMovingSongId(songId);
    setMutationError(null);

    try {
      const reorderedSongs = reorderCollectionSongs({
        direction,
        songId,
        songs: detail.songs,
      });

      await updateCollectionSongOrder({
        collectionId: id,
        kind,
        songIds: reorderedSongs.map((song) => song.id),
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Song order could not be saved.",
      );
    } finally {
      setMovingSongId(null);
    }
  };

  const removeSong = async (songId: number) => {
    setRemovingSongId(songId);
    setMutationError(null);

    try {
      await removeSongFromCollection({
        collectionId: id,
        kind,
        songId,
      });
      sendHaptic("medium");
    } catch (caughtError) {
      sendHaptic("error");
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Song could not be removed.",
      );
    } finally {
      setRemovingSongId(null);
    }
  };

  return {
    actionState,
    deleteCurrentCollection,
    exportCollection,
    moveSong,
    movingSongId,
    mutationError,
    playCollection,
    queueCollection,
    removeSong,
    removingSongId,
  };
}
