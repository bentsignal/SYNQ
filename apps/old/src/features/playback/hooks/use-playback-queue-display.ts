import {
  usePlaybackModeContext,
  usePlaybackQueueRefreshContext,
} from "@/src/features/playback/context/PlaybackProvider";
import {
  getPlaybackQueueDisplayActiveIndex,
  getPlaybackQueueDisplayState,
} from "@/src/features/playback/lib/playback-queue-display";
import { moveQueueTrack } from "@/src/features/playback/lib/player-queue-actions-service";
import { SongType } from "@/src/constants/Types";
import { check } from "@/src/lib/util";
import { type MutableRefObject, useCallback, useEffect, useState } from "react";
import { type DragEndParams } from "react-native-draggable-flatlist";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useActiveTrack } from "react-native-track-player";

type PlaybackQueueDisplayParams = {
  listRef: MutableRefObject<any>;
};

export const usePlaybackQueueDisplay = ({
  listRef,
}: PlaybackQueueDisplayParams) => {
  const { shuffle } = usePlaybackModeContext();
  const { queueRevision } = usePlaybackQueueRefreshContext();
  const track = useActiveTrack();

  const [songs, setSongs] = useState<SongType[]>([]);
  const listOpacity = useSharedValue(0);

  const scrollToIndex = useCallback(
    (index: number | undefined, animated: boolean = true) => {
      if (check(index)) {
        listRef.current?.scrollToIndex({
          index,
          animated,
        });
      }
    },
    [listRef],
  );

  useEffect(() => {
    let cancelled = false;

    const loadDisplayState = async () => {
      const displayState = await getPlaybackQueueDisplayState();
      if (cancelled) {
        return;
      }

      setSongs(displayState.songs);
      scrollToIndex(displayState.activeIndex, false);
      listOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      });
    };

    void loadDisplayState();

    return () => {
      cancelled = true;
    };
  }, [listOpacity, queueRevision, scrollToIndex, shuffle]);

  useEffect(() => {
    let cancelled = false;

    const scrollToActiveIndex = async () => {
      const activeIndex = await getPlaybackQueueDisplayActiveIndex();
      if (!cancelled) {
        scrollToIndex(activeIndex);
      }
    };

    void scrollToActiveIndex();

    return () => {
      cancelled = true;
    };
  }, [scrollToIndex, track]);

  const listContainerStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    flex: 1,
    width: "100%",
    alignSelf: "center",
  }));

  const onDragEnd = async ({ data, from, to }: DragEndParams<any>) => {
    setSongs(data);
    await moveQueueTrack(from, to);
  };

  return {
    listContainerStyle,
    onDragEnd,
    songs,
  };
};
