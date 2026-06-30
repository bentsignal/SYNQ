import { PageType, SongType } from "@/src/constants/Types";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import usePlayer from "@/src/features/playback/hooks/use-player";
import {
  getActiveQueueTrackIndex,
  getPlaybackQueue,
} from "@/src/features/playback/lib/player-queue-actions-service";
import { getLibrarySongById } from "@/src/features/library/repository/library-song-repository";
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
  const { queueRevision, shuffle } = usePlaybackContext();
  const { moveQueueSong } = usePlayer();
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
    const results: SongType[] = [];
    const queue = await getPlaybackQueue();
    try {
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].id !== -1) {
          const result = await getLibrarySongById(queue[i].id, PageType.QUEUE);
          if (!result) {
            continue;
          }
          result.uuid = queue[i].description;
          results.push(result);
        }
      }
    } catch (error) {
      console.log("error loading queue songs to display in list:", error);
    }
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
    await moveQueueSong(from, to);
  };

  return {
    listContainerStyle,
    onDragEnd,
    songs,
  };
};
