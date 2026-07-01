import { useCallback, useState } from "react";
import {
  getDecrementedAddOffset,
  getIncrementedAddOffset,
  persistPlaybackAddOffset,
} from "@/src/features/playback/lib/playback-add-offset-service";

export const usePlaybackAddOffset = () => {
  const [addOffset, setAddOffset] = useState<number>(0);

  const incrementAddOffset = useCallback(async () => {
    const newOffset = getIncrementedAddOffset(addOffset);
    setAddOffset(newOffset);
    await persistPlaybackAddOffset(newOffset);
  }, [addOffset]);

  const decrementAddOffset = useCallback(async () => {
    const newOffset = getDecrementedAddOffset(addOffset);
    if (newOffset !== addOffset) {
      setAddOffset(newOffset);
      await persistPlaybackAddOffset(newOffset);
    }
  }, [addOffset]);

  const resetAddOffset = useCallback(async () => {
    setAddOffset(0);
    await persistPlaybackAddOffset(0);
  }, []);

  return {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  };
};
