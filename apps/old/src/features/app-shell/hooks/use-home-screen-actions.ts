import { useCallback } from "react";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import { useIngestStore } from "@/src/features/ingest/hooks/use-ingest";
import { useHomePlaybackEffects } from "@/src/features/playback/hooks/use-home-playback-effects";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";

export const useHomeScreenActions = () => {
  const { setLoading, setResults } = useImportFlowContext();
  const { setShowInfoModal } = useAppShellContext();
  const { setShowImportAd } = useGlobalProgressContext();
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const ingestFromFileBrowser = useIngestStore(
    (state) => state.ingestFromFileBrowser,
  );

  useHomePlaybackEffects();

  const showInfo = useCallback(() => {
    setShowInfoModal(true);
  }, [setShowInfoModal]);

  const openPremium = useCallback(() => {
    posthog.capture("check_premium", {
      premium,
    });
    router.push("/premium");
  }, [premium]);

  const importFromFiles = useCallback(() => {
    ingestFromFileBrowser();
  }, [ingestFromFileBrowser]);

  const importFromNetwork = useCallback(() => {
    setLoading(true);
    posthog.capture("import_wifi");
    router.push("/import/wifi");
    setTimeout(() => {
      setResults([]);
      setShowImportAd(true);
    }, 10);
  }, [setLoading, setResults, setShowImportAd]);

  return {
    importFromFiles,
    importFromNetwork,
    openPremium,
    premium,
    showInfo,
    theme,
  };
};
