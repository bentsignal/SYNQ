import {
  usePlaybackModeContext,
  usePlaybackQueueRefreshContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { getActiveQueueTrackIndex } from "@/src/features/playback/lib/playback-queue-read-service";
import { getPlaybackQueueDisplaySongs } from "@/src/features/playback/lib/playback-queue-display";
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
    async (animated: boolean = true) => {
      const index = await getActiveQueueTrackIndex();
      if (check(index)) {
        listRef.current?.scrollToIndex({
          index,
          animated,
        });
      }
    },
    [listRef],
  );

  const loadSongs = useCallback(async () => {
    const results = await getPlaybackQueueDisplaySongs();
    setSongs(results);
    scrollToIndex(false);
    listOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [listOpacity, scrollToIndex]);

  useEffect(() => {
    scrollToIndex();
  }, [scrollToIndex, track]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs, queueRevision, shuffle]);

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
