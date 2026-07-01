import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usePlaybackAddOffset = () => {
  const [addOffset, setAddOffset] = useState<number>(0);

  const incrementAddOffset = useCallback(async () => {
    const newOffset = addOffset + 1;
    setAddOffset(newOffset);
    await AsyncStorage.setItem("addOffset", newOffset.toString());
  }, [addOffset]);

  const decrementAddOffset = useCallback(async () => {
    if (addOffset > 0) {
      const newOffset = addOffset - 1;
      setAddOffset(newOffset);
      await AsyncStorage.setItem("addOffset", newOffset.toString());
    }
  }, [addOffset]);

  const resetAddOffset = useCallback(async () => {
    setAddOffset(0);
    await AsyncStorage.setItem("addOffset", "0");
  }, []);

  return {
    addOffset,
    decrementAddOffset,
    incrementAddOffset,
    resetAddOffset,
    setAddOffset,
  };
};
