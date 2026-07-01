import { useCallback, useEffect, useState } from "react";
import { PageType, SourceType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { removeImportSongs } from "@/src/features/import/lib/import-song-edits";
import {
  addSongToLibraryPlaylist,
  isSongInLibraryPlaylist,
  removeSongFromLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Alert } from "react-native";

const actionDelay = 10;

const librarySongPages = [
  PageType.LIBRARY,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
];

const queuePages = [
  PageType.LIBRARY,
  PageType.QUEUE,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
];

const editPages = [
  PageType.LIBRARY,
  PageType.IMPORT,
  PageType.ARTIST,
  PageType.ALBUM,
];

const exportPages = [
  PageType.LIBRARY,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
  PageType.IMPORT,
];

const deletePages = [PageType.LIBRARY, PageType.IMPORT];

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
    posthog.capture("delete_song");

    if (selectedSongs.length > 0) {
      const newResults = await removeImportSongs(results, selectedSongs);
      if (newResults.length <= 0) {
        setExportDisabled(true);
        router.replace("/(tabs)");
      }
      setResults(newResults);
    } else if (editSong.pageType === PageType.LIBRARY) {
      await deleteLibrarySong(editSong.id);
      await removeSongsFromQueue([editSong.id]);
      setNumModified((modified) => modified + 1);
    } else if (editSong.pageType === PageType.IMPORT) {
      const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id];
      const newResults = await removeImportSongs(results, ids);
      if (newResults.length <= 0) {
        setExportDisabled(true);
      }
      if (newResults.length === 0) {
        router.replace("/(tabs)");
      }
      setResults(newResults);
    }
  }, [
    editSong.id,
    editSong.pageType,
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

  const canExportFromPage = exportPages.includes(pageType);
  const canDeleteFromPage = deletePages.includes(pageType);

  return {
    handleAddToPlaylist,
    handleAddToQueue,
    handleDeleteSong,
    handleEditSong,
    handleExport,
    handleRemoveFromPlaylist,
    handleToggleInLiked,
    inLiked,
    showAddToPlaylist: librarySongPages.includes(pageType),
    showAddToQueue: queuePages.includes(pageType),
    showDelete: premium ? canDeleteFromPage : canDeleteFromPage && library,
    showEdit: editPages.includes(pageType),
    showExport: premium ? canExportFromPage : canExportFromPage && library,
    showLikedToggle: librarySongPages.includes(pageType),
    showRemoveFromPlaylist:
      [PageType.LIBRARY, PageType.PLAYER].includes(pageType) &&
      editSong.sourceId !== undefined &&
      editSong.sourceId !== 1 &&
      editSong.sourceType === SourceType.PLAYLIST,
  };
}
