import { useEffect, useState } from "react";
import TrackPlayer, {
  type Track,
  useActiveTrack,
} from "react-native-track-player";

export const useActiveQueueTrack = () => {
  const activeTrack = useActiveTrack();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const updateActiveIndex = async () => {
      const index = await TrackPlayer.getActiveTrackIndex();
      if (index !== undefined) {
        setActiveIndex(index);
      }
    };

    updateActiveIndex();
  }, [activeTrack]);

  return {
    activeIndex,
    activeTrack: activeTrack as Track | undefined,
  };
};
