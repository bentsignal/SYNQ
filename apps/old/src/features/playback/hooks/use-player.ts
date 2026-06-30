import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { getTrackFromSong } from "@/src/features/playback/lib/player-track-service";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import { getNextUp } from "@/src/features/playback/lib/playback-queue-service";
import { setupPlayer as setupTrackPlayer } from "@/src/features/playback/lib/player-setup-service";
import { useHaptics } from "@/src/hooks/use-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer, { Track } from "react-native-track-player";

export default function usePlayer() {
  const {
    setShuffle,
    setLoop,
    setSourceType,
    setSourceId,
    addOffset,
    setAddOffset,
    sourceType,
    sourceId,
    shuffle,
    loop,
    incrementAddOffset,
    decrementAddOffset,
    resetAddOffset,
    sort,
    order,
    query,
    requestQueueRefresh,
  } = usePlaybackContext();

  const { theme } = useThemeContext();
  const { sendHaptic } = useHaptics();

  const setupPlayer = async () => {
    await setupTrackPlayer({
      setShuffle,
      setLoop,
      setSourceType,
      setSourceId,
      setAddOffset,
    });
  };

  const addToQueue = async (track: Track) => {
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex !== undefined) {
      await TrackPlayer.add(track, currentIndex + addOffset + 1);
      await incrementAddOffset();
    }
    const queue = await TrackPlayer.getQueue();
    await AsyncStorage.setItem("queue", JSON.stringify(queue));
  };

  const skipRight = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getActiveTrackIndex();
      if (currentIndex === undefined) {
        sendHaptic("error");
        return;
      }

      if (currentIndex >= queue.length - 1 && !loop) {
        // no next song
        sendHaptic("error");
      } else {
        // if loop is on, keep queue going infinitely
        if (currentIndex >= queue.length - 1 && loop) {
          if (sourceType === null || sourceId === null) {
            sendHaptic("error");
            return;
          }

          await updateQueue(
            queue[currentIndex].id,
            shuffle,
            sourceType,
            sourceId,
            sort,
            order,
            query,
          );
        }
        let nextIndex = currentIndex + 1;
        let nextTrack = await TrackPlayer.getTrack(nextIndex);
        while (nextTrack?.id === -1 && nextIndex < queue.length) {
          nextIndex++;
          nextTrack = await TrackPlayer.getTrack(nextIndex);
        }
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
      }
      await decrementAddOffset();
    } catch (error) {
      console.log("error skipping right: ", error);
    }
  };

  const skipLeft = async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      const index = await TrackPlayer.getActiveTrackIndex();
      if (progress.position < 3 && index !== 0 && index !== undefined) {
        let nextIndex = index - 1;
        let nextTrack = await TrackPlayer.getTrack(nextIndex);
        while (nextTrack?.id === -1 && nextIndex >= 0) {
          nextIndex--;
          nextTrack = await TrackPlayer.getTrack(nextIndex);
        }
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
        if (addOffset > 0) await incrementAddOffset();
      } else {
        await TrackPlayer.seekTo(0);
      }
    } catch (error) {
      console.log("error skipping left: ", error);
    }
  };

  const updateQueue = async (
    currentId: number,
    shuffleValue: boolean,
    sourceTypeValue: SourceType,
    sourceIdValue: number,
    sort?: SortType,
    order?: SortOrder,
    query?: string,
  ) => {
    await TrackPlayer.removeUpcomingTracks();
    const upcoming = await getNextUp(
      currentId,
      100,
      shuffleValue,
      sourceTypeValue,
      sourceIdValue,
      sort,
      order,
      query,
    );
    let upcomingTracks: Track[] = [];
    for (let i = 0; i < upcoming.length; i++) {
      const newTrack = await getTrackFromSong(upcoming[i], theme);
      if (newTrack) {
        upcomingTracks.push(newTrack);
      }
    }
    await TrackPlayer.add(upcomingTracks);
    requestQueueRefresh();
    const queue = await TrackPlayer.getQueue();
    await AsyncStorage.setItem("queue", JSON.stringify(queue));
    await resetAddOffset();
  };

  return {
    setupPlayer,
    addToQueue,
    skipRight,
    skipLeft,
    updateQueue,
  };
}
