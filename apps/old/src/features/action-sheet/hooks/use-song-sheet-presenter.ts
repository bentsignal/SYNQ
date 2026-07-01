import { PageType, type SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { presentActionSheetItem } from "@/src/features/action-sheet/lib/present-action-sheet";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useCallback } from "react";

export function useSongSheetPresenter() {
  const { setEditSong } = useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const presentSongSheet = useCallback(
    (song: SongType | null | undefined) => {
      presentActionSheetItem({
        getSheetName: (item) =>
          item.pageType === PageType.IMPORT ? "import-song-sheet" : "song-sheet",
        item: song,
        sendHaptic,
        setItem: setEditSong,
      });
    },
    [sendHaptic, setEditSong],
  );

  return {
    presentSongSheet,
  };
}
