import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import {
  skipToNextPlayableTrack,
  skipToPreviousPlayableTrack,
} from "@/src/features/playback/lib/playback-queue-navigation-service";

type SendPlaybackError = (type: "error") => void;

export type PlaybackSkipRightCommandArgs = {
  decrementAddOffset: () => Promise<void>;
  loop: boolean;
  order: SortOrder;
  query: string;
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
  sendPlaybackError: SendPlaybackError;
  shuffle: boolean;
  sort: SortType;
  sourceId: number | null;
  sourceType: SourceType | null;
  theme: string;
};

export type PlaybackSkipLeftCommandArgs = {
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
};

export const getSkipRightCommand = ({
  decrementAddOffset,
  loop,
  order,
  query,
  requestQueueRefresh,
  resetAddOffset,
  sendPlaybackError,
  shuffle,
  sort,
  sourceId,
  sourceType,
  theme,
}: PlaybackSkipRightCommandArgs) => {
  return () =>
    skipToNextPlayableTrack({
      loop,
      sourceType,
      sourceId,
      shuffle,
      sort,
      order,
      query,
      theme,
      sendPlaybackError,
      decrementAddOffset,
      requestQueueRefresh,
      resetAddOffset,
    });
};

export const getSkipLeftCommand = ({
  addOffset,
  incrementAddOffset,
}: PlaybackSkipLeftCommandArgs) => {
  return () =>
    skipToPreviousPlayableTrack({
      addOffset,
      incrementAddOffset,
    });
};
