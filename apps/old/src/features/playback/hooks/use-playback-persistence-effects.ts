import { useEffect, useRef, useState } from "react";
import {
  usePlaybackAddOffsetContext,
  usePlaybackLifecycleContext,
} from "@/src/features/playback/context/PlaybackProvider";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { setPlaybackStorageNumber } from "@/src/features/playback/lib/playback-storage-service";
import { getActiveQueueTrackIndex } from "@/src/features/playback/lib/playback-queue-read-service";
import { type Track } from "react-native-track-player";

type PlaybackPersistenceEffectsParams = {
  position: number;
  track?: Track;
};

export const usePlaybackPersistenceEffects = ({
  position,
  track,
}: PlaybackPersistenceEffectsParams) => {
  const { addOffset, decrementAddOffset } = usePlaybackAddOffsetContext();
  const { playerInitialized, setPlayerInitialized } =
    usePlaybackLifecycleContext();
  const { setupPlayer } = usePlayer();
  const setupStarted = useRef(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (playerInitialized || setupStarted.current) {
      return;
    }

    setupStarted.current = true;

    try {
      setupPlayer();
      setPlayerInitialized(true);
    } catch (error) {
      console.log("error setting up player: ", error);
    }
  }, [playerInitialized, setPlayerInitialized, setupPlayer]);

  useEffect(() => {
    if (position) {
      setPlaybackStorageNumber("position", position);
    }
  }, [position]);

  useEffect(() => {
    const initIndex = async () => {
      const activeIndex = await getActiveQueueTrackIndex();
      if (activeIndex !== undefined) {
        setIndex(activeIndex);
      }
    };
    initIndex();
  }, []);

  useEffect(() => {
    const checkNewIndex = async () => {
      const newIndex = await getActiveQueueTrackIndex();
      if (newIndex === undefined) {
        return;
      }

      if (newIndex !== index) {
        if (newIndex - index === 1 && addOffset > 0) {
          decrementAddOffset();
        }
        setIndex(newIndex);
      }
    };
    checkNewIndex();
  }, [addOffset, decrementAddOffset, index, track]);

  useEffect(() => {
    const updateLastTrackIndex = async () => {
      if (track) {
        const activeIndex = await getActiveQueueTrackIndex();
        if (activeIndex !== undefined) {
          await setPlaybackStorageNumber("lastTrackIndex", activeIndex);
        }
      }
    };
    updateLastTrackIndex();
  }, [track]);
};
