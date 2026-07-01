import {
  NotificationType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import {
  getSkipLeftCommand,
  getSkipRightCommand,
} from "@/src/features/playback/lib/playback-skip-command-service";
import {
  pausePlayback,
  playPlayback,
  seekToPlaybackPosition,
} from "@/src/features/playback/lib/playback-transport-service";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";
import { resetPlaybackQueue } from "@/src/features/playback/lib/player-queue-actions-service";
import {
  Event,
  type EventPayloadByEventWithType,
  type Track,
} from "react-native-track-player";

export const playbackRemoteEvents = [
  Event.RemotePlay,
  Event.RemotePause,
  Event.RemoteNext,
  Event.RemotePrevious,
  Event.RemoteSeek,
  Event.PlaybackQueueEnded,
  Event.PlaybackError,
];

type PlaybackRemoteEvent = (typeof playbackRemoteEvents)[number];
type PlaybackRemoteEventPayload =
  EventPayloadByEventWithType[PlaybackRemoteEvent];
type RunAdGatedPlaybackCommand = (params: {
  command: () => Promise<void> | void;
}) => Promise<unknown>;
type SendPlaybackError = (type: "error") => void;
type AddPlaybackErrorNotification = (
  type: NotificationType,
  title: string,
  subtitle: string,
  body: string,
  details: string,
  onPress: () => void,
) => void;

type PlaybackRemoteEventCommandArgs = {
  addNotification: AddPlaybackErrorNotification;
  addOffset: number;
  adPlaying: boolean;
  decrementAddOffset: () => Promise<void>;
  event: PlaybackRemoteEventPayload;
  incrementAddOffset: () => Promise<void>;
  loop: boolean;
  order: SortOrder;
  query: string;
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
  runAdGatedPlaybackCommand: RunAdGatedPlaybackCommand;
  sendPlaybackError: SendPlaybackError;
  setShowNotificationModal: (showNotificationModal: boolean) => void;
  setShowOverlay: (showOverlay: boolean) => void;
  shuffle: boolean;
  sort: SortType;
  sourceId: number | null;
  sourceType: SourceType | null;
  theme: string;
  track?: Track;
};

const showPlaybackErrorNotification = ({
  addNotification,
  event,
  setShowNotificationModal,
  setShowOverlay,
  track,
}: Pick<
  PlaybackRemoteEventCommandArgs,
  | "addNotification"
  | "setShowNotificationModal"
  | "setShowOverlay"
  | "track"
> & {
  event: Extract<PlaybackRemoteEventPayload, { type: Event.PlaybackError }>;
}) => {
  const name = track?.title || "Unknown Song";
  addNotification(
    NotificationType.ERROR,
    "Playback Error",
    "Unable to play " + name,
    "We ran into an issue while trying to play " + name + ".",
    event.message,
    () => {
      setShowOverlay(true);
      setShowNotificationModal(true);
    },
  );
};

export const handlePlaybackRemoteEvent = ({
  event,
  ...args
}: PlaybackRemoteEventCommandArgs) => {
  const skipRight = getSkipRightCommand(args);
  const skipLeft = getSkipLeftCommand(args);
  const skipRightRemoteCommand = async () => {
    await skipRight();
  };
  const skipLeftRemoteCommand = async () => {
    await skipLeft();
  };

  switch (event.type) {
    case Event.RemotePlay:
      void playPlayback();
      break;
    case Event.RemotePause:
      void pausePlayback();
      break;
    case Event.RemoteNext:
      void args.runAdGatedPlaybackCommand({ command: skipRightRemoteCommand });
      break;
    case Event.RemotePrevious:
      void args.runAdGatedPlaybackCommand({ command: skipLeftRemoteCommand });
      break;
    case Event.RemoteSeek:
      if (!args.adPlaying) {
        void seekToPlaybackPosition(event.position);
      }
      break;
    case Event.PlaybackQueueEnded:
      if (
        args.loop &&
        args.track &&
        args.sourceType !== null &&
        args.sourceId !== null
      ) {
        void updateUpcomingQueue({
          currentId: args.track.id,
          shuffleValue: args.shuffle,
          sourceTypeValue: args.sourceType,
          sourceIdValue: args.sourceId,
          sort: args.sort,
          order: args.order,
          query: args.query,
          theme: args.theme,
          requestQueueRefresh: args.requestQueueRefresh,
          resetAddOffset: args.resetAddOffset,
        });
        void skipRight();
      }
      break;
    case Event.PlaybackError:
      console.log("playback error: ", event);
      void resetPlaybackQueue();
      showPlaybackErrorNotification({
        addNotification: args.addNotification,
        event,
        setShowNotificationModal: args.setShowNotificationModal,
        setShowOverlay: args.setShowOverlay,
        track: args.track,
      });
      break;
  }
};
