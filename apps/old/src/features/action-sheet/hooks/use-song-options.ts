import { useCallback, useEffect, useState } from "react";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { executeSongDeleteAction } from "@/src/features/action-sheet/lib/song-delete-action";
import { getSongOptionVisibility } from "@/src/features/action-sheet/lib/song-option-visibility";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  addSongToLibraryPlaylist,
  isSongInLibraryPlaylist,
  removeSongFromLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Alert } from "react-native";

const actionDelay = 10;

export function useSongOptions(sheetName: string, library: boolean) {
  const { editSong, setNumModified } = useActionSheetContext();
  const { results, setExportDisabled, setResults } = useImportFlowContext();
  const { setShowImportAd, setShowGlobalLoading } =
    useGlobalProgressContext();
  const { selectedSongs } = useSelectionContext();
  const { addSongToQueue, removeSongsFromQueue } = usePlayer();
  const { premium } = usePremiumContext();
  const { sendHaptic } = useHaptics();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);
  const [inLiked, setInLiked] = useState(false);

  const refreshInLiked = useCallback(async (songId: number) => {
    const liked = await isSongInLibraryPlaylist(2, songId);
    setInLiked(liked);
  }, []);

  useEffect(() => {
    if (editSong.pageType) {
      try {
        setPageType(editSong.pageType);
        refreshInLiked(editSong.id);
      } catch (error) {
        console.log("error getting options for new song: ", error);
      }
    }
  }, [editSong.id, editSong.pageType, refreshInLiked]);

  const handleAddToQueue = useCallback(() => {
    TrueSheet.dismiss(sheetName);
    sendHaptic("light");
    setTimeout(async () => {
      await addSongToQueue(editSong);
    }, actionDelay);
  }, [addSongToQueue, editSong, sendHaptic, sheetName]);

  const handleEditSong = useCallback(() => {
    TrueSheet.dismiss(sheetName);
    posthog.capture("edit_song");
    setTimeout(() => {
      router.push(`/song/edit/${editSong.id}`);
    }, actionDelay);
  }, [editSong.id, sheetName]);

  const handleExport = useCallback(async () => {
    try {
      posthog.capture("export_song");
      TrueSheet.dismiss(sheetName);
      if (pageType === PageType.IMPORT && !premium) {
        setShowImportAd(true);
      } else {
        setShowImportAd(false);
      }
      setShowGlobalLoading(true);
      await exportSongs([editSong]);
      setNumModified((modified) => modified + 1);
    } catch (error) {
      console.log("error exporting song: ", error);
    } finally {
      setShowGlobalLoading(false);
    }
  }, [
    editSong,
    pageType,
    premium,
    setNumModified,
    setShowGlobalLoading,
    setShowImportAd,
    sheetName,
  ]);

  const executeDelete = useCallback(async () => {
    await executeSongDeleteAction({
      editSong,
      results,
      selectedSongIds: selectedSongs,
      removeSongsFromQueue,
      setExportDisabled,
      setResults,
      onLibrarySongDeleted: () => {
        setNumModified((modified) => modified + 1);
      },
    });
  }, [
    editSong,
    removeSongsFromQueue,
    results,
    selectedSongs,
    setExportDisabled,
    setNumModified,
    setResults,
  ]);

  const handleDeleteSong = useCallback(() => {
    TrueSheet.dismiss(sheetName);
    setTimeout(() => {
      Alert.alert(
        `${selectedSongs.length > 1 ? "Delete songs" : "Delete song"}`,
        `Are you sure you want to delete ${editSong.fileName ?? "this song"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              executeDelete();
            },
          },
        ],
      );
    }, actionDelay);
  }, [editSong.fileName, executeDelete, selectedSongs.length, sheetName]);

  const handleAddToPlaylist = useCallback(() => {
    posthog.capture("add_to_playlist");
    TrueSheet.dismiss(sheetName);
    setTimeout(() => {
      router.push("/playlist/add");
    }, 200);
  }, [sheetName]);

  const handleRemoveFromPlaylist = useCallback(async () => {
    posthog.capture("remove_from_playlist");
    TrueSheet.dismiss(sheetName);
    try {
      if (editSong.sourceId === undefined) {
        return;
      }
      await removeSongFromLibraryPlaylist(editSong.sourceId, editSong.id);
    } catch (error) {
      console.log("error removing from playlist: ", error);
    }
  }, [editSong.id, editSong.sourceId, sheetName]);

  const handleToggleInLiked = useCallback(async () => {
    posthog.capture("toggle_in_liked");
    TrueSheet.dismiss(sheetName);
    try {
      if (inLiked) {
        await removeSongFromLibraryPlaylist(2, editSong.id);
        setInLiked(false);
      } else {
        await addSongToLibraryPlaylist(2, editSong.id);
        setInLiked(true);
      }
    } catch (error) {
      console.log("error toggling in favorites: ", error);
    }
  }, [editSong.id, inLiked, sheetName]);

  const visibility = getSongOptionVisibility({
    library,
    pageType,
    premium,
    sourceId: editSong.sourceId,
    sourceType: editSong.sourceType,
  });

  return {
    handleAddToPlaylist,
    handleAddToQueue,
    handleDeleteSong,
    handleEditSong,
    handleExport,
    handleRemoveFromPlaylist,
    handleToggleInLiked,
    inLiked,
    ...visibility,
  };
}
