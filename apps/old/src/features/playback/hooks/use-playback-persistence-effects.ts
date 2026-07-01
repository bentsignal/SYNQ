import { useEffect, useRef, useState } from "react";
import {
  usePlaybackAddOffsetContext,
  usePlaybackLifecycleContext,
  usePlaybackModeContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import {
  getCurrentActiveQueueIndex,
  reconcileAddOffsetAfterActiveIndexChange,
} from "@/src/features/playback/lib/playback-add-offset-service";
import { setPlaybackStorageNumber } from "@/src/features/playback/lib/playback-storage-service";
import { getActiveQueueTrackIndex } from "@/src/features/playback/lib/playback-queue-read-service";
import { setupPlayer } from "@/src/features/playback/lib/player-setup-service";
import { type Track } from "react-native-track-player";

type PlaybackPersistenceEffectsParams = {
  position: number;
  track?: Track;
};

export const usePlaybackPersistenceEffects = ({
  position,
  track,
}: PlaybackPersistenceEffectsParams) => {
  const { addOffset, decrementAddOffset, setAddOffset } =
    usePlaybackAddOffsetContext();
  const { playerInitialized, setPlayerInitialized } =
    usePlaybackLifecycleContext();
  const { setLoop, setShuffle } = usePlaybackModeContext();
  const { setSourceId, setSourceType } = usePlaybackSourceContext();
  const setupStarted = useRef(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (playerInitialized || setupStarted.current) {
      return;
    }

    setupStarted.current = true;

    try {
      setupPlayer({
        setShuffle,
        setLoop,
        setSourceType,
        setSourceId,
        setAddOffset,
      });
      setPlayerInitialized(true);
    } catch (error) {
      console.log("error setting up player: ", error);
    }
  }, [
    playerInitialized,
    setAddOffset,
    setLoop,
    setPlayerInitialized,
    setShuffle,
    setSourceId,
    setSourceType,
  ]);

  useEffect(() => {
    if (position) {
      setPlaybackStorageNumber("position", position);
    }
  }, [position]);

  useEffect(() => {
    const initIndex = async () => {
      const activeIndex = await getCurrentActiveQueueIndex();
      if (activeIndex !== undefined) {
        setIndex(activeIndex);
      }
    };
    initIndex();
  }, []);

  useEffect(() => {
    const checkNewIndex = async () => {
      const newIndex = await reconcileAddOffsetAfterActiveIndexChange({
        addOffset,
        decrementAddOffset,
        previousIndex: index,
      });

      if (newIndex !== undefined && newIndex !== index) {
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
