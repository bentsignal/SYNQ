import { useCallback } from "react";
import { router } from "expo-router";

export const useOpenPlayer = () => {
  const openPlayer = useCallback(() => {
    router.push("/player");
  }, []);

  return {
    openPlayer,
  };
};
