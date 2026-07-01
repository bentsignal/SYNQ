import { useState } from "react";

export const usePlaybackModeState = () => {
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);

  return {
    loop,
    setLoop,
    setShuffle,
    shuffle,
  };
};
