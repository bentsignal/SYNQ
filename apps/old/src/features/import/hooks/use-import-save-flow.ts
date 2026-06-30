import { useCallback, useEffect, useRef } from "react";
import CFG from "@/src/constants/Config";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useImportTransferCompletion } from "@/src/features/import/hooks/use-import-transfer-completion";
import { deleteImportSongs } from "@/src/features/import/lib/import-song-edits";
import { saveImportSongsToLibrary } from "@/src/features/import/lib/save-import-to-library";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, usePathname } from "expo-router";
import * as StoreReview from "expo-store-review";

export function useImportSaveFlow() {
  const {
    results,
    loading,
    ip,
    transferProgress,
    transferSize,
    setExportDisabled,
    setLoading,
    setTransferProgress,
    setTransferSize,
    setResults,
    importState,
    shouldSaveToLibrary,
    importFinishRequest,
    setShouldSaveToLibrary,
  } = useImportFlowContext();

  const {
    showImportAd,
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
    setShowGlobalLoading,
  } = useGlobalProgressContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const { sendHaptic } = useHaptics();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const handledImportFinishRequest = useRef(0);
  const saveCompletion = useImportTransferCompletion({
    transferProgress,
    transferSize,
  });

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const resetResults = useCallback(async () => {
    try {
      await axios.get(`http://${ip}${CFG.PORT}/reset`);
    } catch (error) {
      console.log("error resetting results: ", error);
    }
  }, [ip]);

  const callReview = useCallback(async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem("reviewAlreadyRequested", "true");
    }
  }, []);

  const checkForReview = useCallback(async () => {
    try {
      const countStr = await AsyncStorage.getItem("importCount");
      const reviewAlreadyRequested = await AsyncStorage.getItem(
        "reviewAlreadyRequested",
      );
      const requested = reviewAlreadyRequested === "true";
      if (requested) return;
      if (premium) {
        await callReview();
      } else if (countStr) {
        const count = parseInt(countStr) + 1;
        await AsyncStorage.setItem("importCount", count.toString());
        if (count >= CFG.showReviewAfter) {
          await callReview();
        }
      } else {
        await AsyncStorage.setItem("importCount", "1");
        if (CFG.showReviewAfter <= 1) {
          await callReview();
        }
      }
    } catch (error) {
      console.log("Error requesting app store review:", error);
    }
  }, [callReview, premium]);

  const checkForAd = useCallback(async () => {
    if (!premium && showImportAd) {
      setShowGlobalProgress(false);
      setShowGlobalLoading(true);
      setGlobalProgress(0);
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          if (progress < CFG.importAdLength) {
            if (progress >= 1) {
              setShowGlobalProgress(true);
            }
            progress += 1;
            setGlobalProgress(Math.ceil((progress / CFG.importAdLength) * 100));
          } else if (
            progress >= CFG.importAdLength &&
            currentPath.current === "/import/save"
          ) {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              setShowGlobalLoading(false);
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
    }
  }, [
    premium,
    setGlobalProgress,
    setShowGlobalLoading,
    setShowGlobalProgress,
    showImportAd,
  ]);

  const finishImport = useCallback(() => {
    setTimeout(() => {
      void checkForReview();
    }, 500);
  }, [checkForReview]);

  const handleSavedImport = useCallback(() => {
    sendHaptic("success");
    router.replace("/import/success");
    setTransferSize(0);
    setTransferProgress(0);
    setShowImportAd(false);
    setResults([]);
    if (importState === 1) {
      void resetResults();
    }
    finishImport();
    setTimeout(() => {
      setLoading(false);
      router.replace({
        pathname: "/(tabs)/library",
        params: {
          category: "songs",
          resetKey: Date.now().toString(),
        },
      });
    }, 1500);
  }, [
    finishImport,
    importState,
    resetResults,
    sendHaptic,
    setLoading,
    setResults,
    setShowImportAd,
    setTransferProgress,
    setTransferSize,
  ]);

  const handleSaveFailure = useCallback(() => {
    setLoading(false);
    sendHaptic("error");
    router.push("/import/failure");
    setTransferSize(0);
    setTransferProgress(0);
    setShowImportAd(false);
    setResults([]);
    if (importState === 1) {
      void resetResults();
    }
  }, [
    importState,
    resetResults,
    sendHaptic,
    setLoading,
    setResults,
    setShowImportAd,
    setTransferProgress,
    setTransferSize,
  ]);

  const saveToLibrary = useCallback(async () => {
    setExportDisabled(true);
    setLoading(true);
    await checkForAd();
    const songs = premium ? results : results.slice(0, 1);
    setTransferProgress(0);
    setTransferSize(songs.length);
    setTimeout(() => {
      saveImportSongsToLibrary(songs, setTransferProgress)
        .then(handleSavedImport)
        .catch(handleSaveFailure);
    }, 10);
  }, [
    checkForAd,
    handleSaveFailure,
    handleSavedImport,
    premium,
    results,
    setExportDisabled,
    setLoading,
    setTransferProgress,
    setTransferSize,
  ]);

  const discardImport = useCallback(async () => {
    sendHaptic("success");
    router.push("/import/success");
    await deleteImportSongs(results);
    setResults([]);
    setTransferSize(0);
    setTransferProgress(0);
    setShowImportAd(false);
    finishImport();
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  }, [
    finishImport,
    results,
    sendHaptic,
    setLoading,
    setResults,
    setShowImportAd,
    setTransferProgress,
    setTransferSize,
  ]);

  const handleImport = useCallback(async () => {
    if (shouldSaveToLibrary) {
      await saveToLibrary();
    } else {
      await discardImport();
    }
  }, [discardImport, saveToLibrary, shouldSaveToLibrary]);

  useEffect(() => {
    if (importFinishRequest > handledImportFinishRequest.current) {
      handledImportFinishRequest.current = importFinishRequest;
      void handleImport();
    }
  }, [handleImport, importFinishRequest]);

  const toggleSave = useCallback(
    (value: boolean) => {
      setShouldSaveToLibrary(value);
      posthog.capture("import_save_to_library", {
        value,
      });
    },
    [setShouldSaveToLibrary],
  );

  return {
    loading,
    saveCompletion,
    shouldSaveToLibrary,
    theme,
    toggleSave,
  };
}
