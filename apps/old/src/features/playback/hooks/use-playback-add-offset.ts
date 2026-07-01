import { useCallback, useState } from "react";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usePlaybackAddOffset = () => {
  const [addOffset, setAddOffset] = useState<number>(0);

  const incrementAddOffset = useCallback(async () => {
    const newOffset = addOffset + 1;
    setAddOffset(newOffset);
    await AsyncStorage.setItem(
      playbackStorageKeys.addOffset,
      newOffset.toString(),
    );
  }, [addOffset]);

  const decrementAddOffset = useCallback(async () => {
    if (addOffset > 0) {
      const newOffset = addOffset - 1;
      setAddOffset(newOffset);
      await AsyncStorage.setItem(
        playbackStorageKeys.addOffset,
        newOffset.toString(),
      );
    }
  }, [addOffset]);

  const resetAddOffset = useCallback(async () => {
    setAddOffset(0);
    await AsyncStorage.setItem(playbackStorageKeys.addOffset, "0");
  }, []);

  return {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  };
};
