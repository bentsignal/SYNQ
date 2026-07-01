import { PageType, type SongType } from "@/src/constants/Types";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

type ExecuteSongExportActionInput = {
  pageType: PageType;
  premium: boolean;
  setNumModified: (update: (modified: number) => number) => void;
  setShowGlobalLoading: (show: boolean) => void;
  setShowImportAd: (show: boolean) => void;
  sheetName: string;
  song: SongType;
};

export async function executeSongExportAction({
  pageType,
  premium,
  setNumModified,
  setShowGlobalLoading,
  setShowImportAd,
  sheetName,
  song,
}: ExecuteSongExportActionInput) {
  try {
    posthog.capture("export_song");
    TrueSheet.dismiss(sheetName);
    setShowImportAd(pageType === PageType.IMPORT && !premium);
    setShowGlobalLoading(true);
    await exportSongs([song]);
    setNumModified((modified) => modified + 1);
  } catch {
    return;
  } finally {
    setShowGlobalLoading(false);
  }
}
