import type { SongType } from "@/src/constants/Types";

type ClearImportSaveStateInput = {
  setResults: (songs: SongType[]) => void;
  setShowImportAd: (show: boolean) => void;
  setTransferProgress: (progress: number) => void;
  setTransferSize: (size: number) => void;
};

export function clearImportSaveState({
  setResults,
  setShowImportAd,
  setTransferProgress,
  setTransferSize,
}: ClearImportSaveStateInput) {
  setTransferSize(0);
  setTransferProgress(0);
  setShowImportAd(false);
  setResults([]);
}
