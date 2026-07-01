import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { persistPlaybackQueue } from "@/src/features/playback/lib/playback-queue-persistence-service";
import { getNextUp } from "@/src/features/playback/lib/playback-queue-service";
import { getTrackFromSong } from "@/src/features/playback/lib/track-factory";
import TrackPlayer, { Track } from "react-native-track-player";

type QueueRefreshActions = {
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
};

type UpdateUpcomingQueueArgs = QueueRefreshActions & {
  currentId: number;
  shuffleValue: boolean;
  sourceTypeValue: SourceType;
  sourceIdValue: number;
  theme: string;
  sort?: SortType;
  order?: SortOrder;
  query?: string;
};

export const updateUpcomingQueue = async ({
  currentId,
  shuffleValue,
  sourceTypeValue,
  sourceIdValue,
  sort,
  order,
  query,
  theme,
  requestQueueRefresh,
  resetAddOffset,
}: UpdateUpcomingQueueArgs) => {
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
  const upcomingTracks: Track[] = [];
  for (let i = 0; i < upcoming.length; i++) {
    const newTrack = await getTrackFromSong(upcoming[i], theme);
    if (newTrack) {
      upcomingTracks.push(newTrack);
    }
  }
  await TrackPlayer.add(upcomingTracks);
  requestQueueRefresh();
  await persistPlaybackQueue();
  await resetAddOffset();
};
