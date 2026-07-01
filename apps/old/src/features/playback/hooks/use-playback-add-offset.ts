import { useCallback, useState } from "react";
import { setPlaybackStorageItem } from "@/src/features/playback/lib/playback-storage-service";

export const usePlaybackAddOffset = () => {
  const [addOffset, setAddOffset] = useState<number>(0);

  const incrementAddOffset = useCallback(async () => {
    const newOffset = addOffset + 1;
    setAddOffset(newOffset);
    await setPlaybackStorageItem("addOffset", newOffset.toString());
  }, [addOffset]);

  const decrementAddOffset = useCallback(async () => {
    if (addOffset > 0) {
      const newOffset = addOffset - 1;
      setAddOffset(newOffset);
      await setPlaybackStorageItem("addOffset", newOffset.toString());
    }
  }, [addOffset]);

  const resetAddOffset = useCallback(async () => {
    setAddOffset(0);
    await setPlaybackStorageItem("addOffset", "0");
  }, []);

  return {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  };
};
