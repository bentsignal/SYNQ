import { useCallback, useMemo } from "react";
import CFG from "@/src/constants/Config";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { removeImportSongs } from "@/src/features/import/lib/import-song-edits";
import { deleteLibrarySong } from "@/src/features/library/repository/library-song-repository";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { posthog } from "@/src/lib/posthog";
import axios from "axios";
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
  const { removeSongsFromQueue } = usePlayer();
  const pathname = usePathname();

  const controls = useMemo(() => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      if (pathname === "/import/files") {
        return {
          altDisabled: loading,
          altTitle: "Cancel",
          mainDisabled: exportDisabled,
          mainTitle: "Next",
        };
      }

      return {
        altDisabled: transferSize > 0,
        altTitle: "Cancel",
        mainDisabled: exportDisabled,
        mainTitle: "Next",
      };
    }

    if (pathname === "/import/export") {
      return {
        altDisabled: showGlobalLoading,
        altTitle: "Back",
        mainDisabled: showGlobalLoading,
        mainTitle: "Next",
      };
    }

    if (pathname === "/import/save") {
      return {
        altDisabled: exportDisabled,
        altTitle: "Back",
        mainDisabled: exportDisabled,
        mainTitle: "Finish",
      };
    }

    if (pathname === "/import/success") {
      return {
        altDisabled: true,
        altTitle: "Back",
        mainDisabled: true,
        mainTitle: "Next",
      };
    }

    return {
      altDisabled: false,
      altTitle: "Cancel",
      mainDisabled: false,
      mainTitle: "Next",
    };
  }, [exportDisabled, loading, pathname, showGlobalLoading, transferSize]);

  const resetResults = useCallback(async () => {
    try {
      await axios.get(`http://${ip}${CFG.PORT}/reset`);
    } catch (error) {
      console.log("error resetting results: ", error);
    }
  }, [ip]);

  const handleAltPress = useCallback(() => {
    if (pathname === "/import/files" || pathname === "/import/wifi") {
      router.back();
      posthog.capture("import_cancel");
      setTimeout(() => {
        setLoading(false);
        setTransferSize(0);
        setResults([]);
        setExportDisabled(true);
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
    } catch (error) {
      console.log("error deleting song: ", error);
    }
    setSelectEnabled(false);
  }, [
    editSong.id,
    editSong.pageType,
    removeSongsFromQueue,
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
    hideMainControls: ["/import/success", "/import/failure"].includes(
      pathname,
    ),
    mainDisabled: controls.mainDisabled,
    mainTitle: controls.mainTitle,
    selectEnabled,
    showBatchActions: selectEnabled && selectedSongs.length > 0,
  };
}
