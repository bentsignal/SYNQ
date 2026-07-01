import type { SongType } from "@/src/constants/Types";

type ClearImportSaveStateInput = {
  setResults: (songs: SongType[]) => void;
  setShowImportAd: (show: boolean) => void;
  setTransferProgress: (progress: number) => void;
  setTransferSize: (size: number) => void;
};

type ClearImportSaveSessionInput = ClearImportSaveStateInput & {
  importState: number;
  resetResults: () => Promise<void>;
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

export function clearImportSaveSession({
  importState,
  resetResults,
  setResults,
  setShowImportAd,
  setTransferProgress,
  setTransferSize,
}: ClearImportSaveSessionInput) {
  clearImportSaveState({
    setResults,
    setShowImportAd,
    setTransferProgress,
    setTransferSize,
  });

  if (importState === 1) {
    void resetResults();
  }
}
