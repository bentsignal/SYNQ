import { useCallback, useMemo } from "react";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  clearImportControlState,
  getImportControlState,
} from "@/src/features/import/lib/import-control-state";
import { removeImportSongs } from "@/src/features/import/lib/import-song-edits";
import { resetWifiTransferServer } from "@/src/features/import/lib/import-transfer-reset";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import { removeTracksBySongIds } from "@/src/features/playback/lib/player-queue-actions-service";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import { router, usePathname } from "expo-router";
import { Alert } from "react-native";

export function useImportControls() {
  const { editSong, setEditSong, setNumModified } = useActionSheetContext();
  const {
    results,
    loading,
    exportDisabled,
    ip,
    transferSize,
    setResults,
    setExportDisabled,
    setLoading,
    setTransferSize,
    setImportState,
    requestImportFinish,
  } = useImportFlowContext();
  const { showGlobalLoading } = useGlobalProgressContext();
  const { selectEnabled, selectedSongs, setSelectEnabled } =
    useSelectionContext();
  const pathname = usePathname();

  const controls = useMemo(
    () =>
      getImportControlState({
        exportDisabled,
        loading,
        pathname,
        showGlobalLoading,
        transferSize,
      }),
    [exportDisabled, loading, pathname, showGlobalLoading, transferSize],
  );

  const resetResults = useCallback(async () => {
    await resetWifiTransferServer(ip);
  }, [ip]);

  const handleAltPress = useCallback(() => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      router.back();
      posthog.capture("import_cancel");
      setTimeout(() => {
        clearImportControlState({
          setExportDisabled,
          setLoading,
          setResults,
          setTransferSize,
        });
        if (pathname === "/import/wifi") {
          void resetResults();
        }
      }, 10);
    } else if (pathname === "/import/export") {
      router.back();
      setLoading(false);
    } else if (pathname === "/import/save") {
      router.back();
    }
  }, [
    pathname,
    resetResults,
    setExportDisabled,
    setLoading,
    setResults,
    setTransferSize,
  ]);

  const handleMainPress = useCallback(() => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      setImportState(0);
      router.push("/import/export");
    } else if (pathname === "/import/export") {
      router.push("/import/save");
    } else if (pathname === "/import/save") {
      requestImportFinish();
      posthog.capture("import_finish", {
        numberOfSongs: results.length,
      });
    }
  }, [pathname, requestImportFinish, results.length, setImportState]);

  const handleEdit = useCallback(() => {
    setEditSong({} as typeof editSong);
    router.push(`/song/edit/${editSong.id}`);
  }, [editSong, setEditSong]);

  const executeDelete = useCallback(async () => {
    try {
      if (selectedSongs.length > 0) {
        const newResults = await removeImportSongs(results, selectedSongs);
        if (newResults.length <= 0) {
          setExportDisabled(true);
          router.replace("/(tabs)");
        }
        setResults(newResults);
      } else if (editSong.pageType === PageType.LIBRARY) {
        await deleteLibrarySong(editSong.id);
        await removeTracksBySongIds([editSong.id]);
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
    } catch {
      posthog.capture("import_delete_failed");
    } finally {
      setSelectEnabled(false);
    }
  }, [
    editSong.id,
    editSong.pageType,
    results,
    selectedSongs,
    setExportDisabled,
    setNumModified,
    setResults,
    setSelectEnabled,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      `${selectedSongs.length > 1 ? "Delete songs" : "Delete song"}`,
      `Are you sure you want to delete ${selectedSongs.length > 1 ? "these songs" : "this song"}?`,
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
  }, [executeDelete, selectedSongs.length]);

  return {
    altDisabled: controls.altDisabled,
    altTitle: controls.altTitle,
    handleAltPress,
    handleDelete,
    handleEdit,
    handleMainPress,
    hideMainControls: controls.hideMainControls,
    mainDisabled: controls.mainDisabled,
    mainTitle: controls.mainTitle,
    selectEnabled,
    showBatchActions: selectEnabled && selectedSongs.length > 0,
  };
}
