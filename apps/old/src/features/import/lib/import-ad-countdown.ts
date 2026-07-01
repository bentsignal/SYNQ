import CFG from "@/src/constants/Config";

type WaitForImportAdCountdownInput = {
  getCurrentPath: () => string;
  setGlobalProgress: (progress: number) => void;
  setShowGlobalLoading: (show: boolean) => void;
  setShowGlobalProgress: (show: boolean) => void;
};

const AD_FINISH_DELAY = 1000;

export async function waitForImportAdCountdown({
  getCurrentPath,
  setGlobalProgress,
  setShowGlobalLoading,
  setShowGlobalProgress,
}: WaitForImportAdCountdownInput) {
  setShowGlobalProgress(false);
  setShowGlobalLoading(true);
  setGlobalProgress(0);

  await new Promise<void>((resolve) => {
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
        getCurrentPath() === "/import/save"
      ) {
        clearInterval(interval);
        setShowGlobalProgress(false);
        setTimeout(() => {
          setShowGlobalLoading(false);
          resolve();
        }, AD_FINISH_DELAY);
      }
    }, 1000);
  });
}
