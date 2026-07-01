import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

export function usePlayerSongEditSheet(name: string) {
  const { sendHaptic } = useHaptics();

  const handleMomentumScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (event.nativeEvent.contentOffset.y >= 0) {
        return;
      }

      TrueSheet.dismiss(name);
      sendHaptic("medium");
    },
    [name, sendHaptic],
  );

  return {
    handleMomentumScrollBegin,
  };
}
