import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { usePlaybackSession } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  deleteLibrarySong,
  setLibrarySongLiked,
} from "../repository/song-metadata-repository";
import {
  getLibrarySongDetailActionState,
  toLibrarySongDetailPlaybackItem,
  toLibrarySongExportItem,
  type LibrarySongDetail,
} from "../services/library-song-detail-service";

export function useLibrarySongDetailController({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) {
  const { addToQueue, playSong, removeFromQueue } = usePlaybackSession();
  const { sendHaptic } = useHapticFeedback();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTogglingLiked, setIsTogglingLiked] = useState(false);
  const actionState = getLibrarySongDetailActionState({
    detail,
    isDeleting,
    isExporting,
    isTogglingLiked,
  });
  const playbackItem = useMemo(
    () => toLibrarySongDetailPlaybackItem({ detail, songId }),
    [detail, songId],
  );

  const playCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    playSong(playbackItem);
    router.push("/player");
  }, [actionState.canPlay, playSong, playbackItem, sendHaptic]);

  const queueCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    addToQueue(playbackItem);
  }, [actionState.canPlay, addToQueue, playbackItem, sendHaptic]);

  const toggleLiked = useCallback(async () => {
    if (!actionState.canToggleLiked) {
      sendHaptic("error");
      return;
    }

    setIsTogglingLiked(true);
    setError(null);

    try {
      await setLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Liked Songs could not be updated.",
      );
    } finally {
      setIsTogglingLiked(false);
    }
  }, [actionState.canToggleLiked, detail.isLiked, sendHaptic, songId]);

  const exportCurrentSong = useCallback(async () => {
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      await shareLibrarySongs([toLibrarySongExportItem({ detail, songId })]);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Song could not be exported.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [actionState.canExport, detail, sendHaptic, songId]);

  const deleteCurrentSong = useCallback(() => {
    if (!actionState.canDelete) {
      sendHaptic("error");
      return;
    }

    Alert.alert("Delete song", `Delete ${detail.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        onPress: async () => {
          setIsDeleting(true);
          setError(null);

          try {
            await deleteLibrarySong(songId);
            removeFromQueue(songId);
            sendHaptic("success");
            router.replace("/(tabs)/library");
          } catch (caughtError) {
            sendHaptic("error");
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Song could not be deleted.",
            );
          } finally {
            setIsDeleting(false);
          }
        },
        style: "destructive",
        text: "Delete",
      },
    ]);
  }, [
    actionState.canDelete,
    detail.title,
    removeFromQueue,
    sendHaptic,
    songId,
  ]);

  return {
    actionState,
    deleteCurrentSong,
    error,
    exportCurrentSong,
    playCurrentSong,
    queueCurrentSong,
    toggleLiked,
  };
}
