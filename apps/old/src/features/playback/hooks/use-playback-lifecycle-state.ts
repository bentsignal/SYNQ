import { useState } from "react";

export const usePlaybackLifecycleState = () => {
  const [playerInitialized, setPlayerInitialized] = useState<boolean>(false);

  return {
    playerInitialized,
    setPlayerInitialized,
  };
};
