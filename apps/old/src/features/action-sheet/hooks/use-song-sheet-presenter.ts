import { PageType, type SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback } from "react";

export function useSongSheetPresenter() {
  const { setEditSong } = useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const presentSongSheet = useCallback(
    (song: SongType | null | undefined) => {
      if (!song) {
        return;
      }

      sendHaptic("light");
      setEditSong(song);
      try {
        TrueSheet.present(
          song.pageType === PageType.IMPORT
            ? "import-song-sheet"
            : "song-sheet",
        );
      } catch {
        return;
      }
    },
    [sendHaptic, setEditSong],
  );

  return {
    presentSongSheet,
  };
}
