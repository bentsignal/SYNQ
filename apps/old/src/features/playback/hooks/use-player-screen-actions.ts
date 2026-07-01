import { type SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { router } from "expo-router";
import { useCallback } from "react";

export function usePlayerScreenActions(song: SongType | null) {
  const { setEditSong } = useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const handleMore = useCallback(() => {
    if (!song) {
      return;
    }

    sendHaptic("light");
    setEditSong(song);
    router.push("/player/edit");
  }, [sendHaptic, setEditSong, song]);

  const handleAddToPlaylist = useCallback(() => {
    if (!song) {
      return;
    }

    setEditSong(song);
    router.push("/playlist/add");
  }, [setEditSong, song]);

  return {
    handleAddToPlaylist,
    handleMore,
  };
}
