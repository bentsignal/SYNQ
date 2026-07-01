import { useCallback } from "react";
import { router } from "expo-router";

export const useOpenPlaybackQueue = () => {
  const openPlaybackQueue = useCallback(() => {
    router.push("/queue");
  }, []);

  return {
    openPlaybackQueue,
  };
};
