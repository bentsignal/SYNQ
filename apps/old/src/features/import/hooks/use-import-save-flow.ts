import { useCallback, useEffect, useRef } from "react";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useImportTransferCompletion } from "@/src/features/import/hooks/use-import-transfer-completion";
import { waitForImportAdCountdown } from "@/src/features/import/lib/import-ad-countdown";
import { deleteImportSongs } from "@/src/features/import/lib/import-song-edits";
import { requestImportReviewIfEligible } from "@/src/features/import/lib/import-review-request";
import {
  clearImportSaveSession,
  clearImportSaveState,
} from "@/src/features/import/lib/import-save-state";
import { resetWifiTransferServer } from "@/src/features/import/lib/import-transfer-reset";
import { saveImportSongsToLibrary } from "@/src/features/import/lib/save-import-to-library";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import { router, usePathname } from "expo-router";

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
    await resetWifiTransferServer(ip);
  }, [ip]);

  const checkForAd = useCallback(async () => {
    if (!premium && showImportAd) {
      await waitForImportAdCountdown({
        getCurrentPath: () => currentPath.current,
        setGlobalProgress,
        setShowGlobalLoading,
        setShowGlobalProgress,
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
      void requestImportReviewIfEligible(premium);
    }, 500);
  }, [premium]);

  const handleSavedImport = useCallback(() => {
    sendHaptic("success");
    router.replace("/import/success");
    clearImportSaveSession({
      importState,
      resetResults,
      setResults,
      setShowImportAd,
      setTransferProgress,
      setTransferSize,
    });
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
    clearImportSaveSession({
      importState,
      resetResults,
      setResults,
      setShowImportAd,
      setTransferProgress,
      setTransferSize,
    });
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
    clearImportSaveState({
      setResults,
      setShowImportAd,
      setTransferProgress,
      setTransferSize,
    });
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
