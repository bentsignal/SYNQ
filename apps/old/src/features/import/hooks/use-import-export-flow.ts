import { useCallback, useEffect, useRef, useState } from "react";
import CFG from "@/src/constants/Config";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import { usePathname } from "expo-router";

export function useImportExportFlow() {
  const { results } = useImportFlowContext();
  const {
    showImportAd,
    setShowGlobalLoading,
    setShowGlobalProgress,
    setGlobalProgress,
    setShowImportAd,
  } = useGlobalProgressContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  const checkForAd = useCallback(async () => {
    if (!premium && showImportAd) {
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
            currentPath.current === "/import/export"
          ) {
            clearInterval(interval);
            setShowGlobalProgress(false);
            setTimeout(() => {
              resolve(void 0);
            }, 1000);
          }
        }, 1000);
      });
    } else {
      setShowImportAd(false);
    }
  }, [
    premium,
    setGlobalProgress,
    setShowGlobalProgress,
    setShowImportAd,
    showImportAd,
  ]);

  const handleExport = useCallback(async () => {
    try {
      posthog.capture("export_during_import");
      setDisabled(true);
      setShowGlobalLoading(true);
      setShowGlobalProgress(false);
      setGlobalProgress(0);
      const songs = premium ? results : [results[0]];
      await checkForAd();
      await exportSongs(songs);
      setShowGlobalLoading(false);
      setDisabled(false);
      setShowImportAd(false);
    } catch (error) {
      setShowGlobalLoading(false);
      setDisabled(false);
      console.log("Error exporting songs: ", error);
    }
  }, [
    checkForAd,
    premium,
    results,
    setGlobalProgress,
    setShowGlobalLoading,
    setShowGlobalProgress,
    setShowImportAd,
  ]);

  return {
    disabled,
    handleExport,
    theme,
  };
}
