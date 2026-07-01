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
import {
  persistActiveQueueTrackIndex,
  persistPlaybackPosition,
} from "@/src/features/playback/lib/playback-progress-persistence-service";
import { setupPlayerIfPossible } from "@/src/features/playback/lib/player-setup-service";
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
    let cancelled = false;

    const initializePlayer = async () => {
      const initialized = await setupPlayerIfPossible({
        setShuffle,
        setLoop,
        setSourceType,
        setSourceId,
        setAddOffset,
      });

      if (cancelled) {
        return;
      }

      if (initialized) {
        setPlayerInitialized(true);
        return;
      }

      setupStarted.current = false;
    };

    void initializePlayer();

    return () => {
      cancelled = true;
    };
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
      persistPlaybackPosition(position);
    }
  }, [position]);

  useEffect(() => {
    let cancelled = false;

    const initIndex = async () => {
      const activeIndex = await getCurrentActiveQueueIndex();
      if (!cancelled && activeIndex !== undefined) {
        setIndex(activeIndex);
      }
    };

    void initIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkNewIndex = async () => {
      const newIndex = await reconcileAddOffsetAfterActiveIndexChange({
        addOffset,
        decrementAddOffset,
        previousIndex: index,
      });

      if (!cancelled && newIndex !== undefined && newIndex !== index) {
        setIndex(newIndex);
      }
    };

    void checkNewIndex();

    return () => {
      cancelled = true;
    };
  }, [addOffset, decrementAddOffset, index, track]);

  useEffect(() => {
    const updateLastTrackIndex = async () => {
      if (track) {
        await persistActiveQueueTrackIndex();
      }
    };

    void updateLastTrackIndex();
  }, [track]);
};
