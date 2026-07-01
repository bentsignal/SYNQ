import { NotificationType } from "@/src/constants/Types";
import {
  usePlaybackAddOffsetContext,
  usePlaybackModeContext,
  usePlaybackQueueFilterContext,
  usePlaybackQueueRefreshContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import {
  skipToNextPlayableTrack,
  skipToPreviousPlayableTrack,
} from "@/src/features/playback/lib/playback-queue-navigation-service";
import {
  pausePlayback,
  playPlayback,
  seekToPlaybackPosition,
} from "@/src/features/playback/lib/playback-transport-service";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";
import { resetPlaybackQueue } from "@/src/features/playback/lib/player-queue-actions-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { Event, type Track, useTrackPlayerEvents } from "react-native-track-player";

type PlaybackRemoteEventsParams = {
  track?: Track;
};

export const usePlaybackRemoteEvents = ({
  track,
}: PlaybackRemoteEventsParams) => {
  const { setShowOverlay } = useAppShellContext();
  const { addNotification, setShowNotificationModal } =
    useNotificationsContext();
  const { adPlaying } = usePlaybackAdContext();
  const { sendHaptic } = useHaptics();
  const { theme } = useThemeContext();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();

  const { loop, shuffle } = usePlaybackModeContext();
  const { sourceId, sourceType } = usePlaybackSourceContext();
  const { order, query, sort } = usePlaybackQueueFilterContext();
  const { requestQueueRefresh } = usePlaybackQueueRefreshContext();
  const { addOffset, decrementAddOffset, incrementAddOffset, resetAddOffset } =
    usePlaybackAddOffsetContext();

  const skipRight = async () => {
    await skipToNextPlayableTrack({
      loop,
      sourceType,
      sourceId,
      shuffle,
      sort,
      order,
      query,
      theme,
      sendPlaybackError: sendHaptic,
      decrementAddOffset,
      requestQueueRefresh,
      resetAddOffset,
    });
  };

  const skipLeft = async () => {
    await skipToPreviousPlayableTrack({
      addOffset,
      incrementAddOffset,
    });
  };

  useTrackPlayerEvents(
    [
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteNext,
      Event.RemotePrevious,
      Event.RemoteSeek,
      Event.PlaybackQueueEnded,
      Event.PlaybackError,
    ],
    (event) => {
      switch (event.type) {
        case Event.RemotePlay:
          void playPlayback();
          break;
        case Event.RemotePause:
          void pausePlayback();
          break;
        case Event.RemoteNext:
          runAdGatedPlaybackCommand({ command: skipRight });
          break;
        case Event.RemotePrevious:
          runAdGatedPlaybackCommand({ command: skipLeft });
          break;
        case Event.RemoteSeek:
          if (!adPlaying) {
            void seekToPlaybackPosition(event.position);
          }
          break;
        case Event.PlaybackQueueEnded:
          if (loop && track && sourceType !== null && sourceId !== null) {
            updateUpcomingQueue({
              currentId: track.id,
              shuffleValue: shuffle,
              sourceTypeValue: sourceType,
              sourceIdValue: sourceId,
              sort,
              order,
              query,
              theme,
              requestQueueRefresh,
              resetAddOffset,
            });
            skipRight();
          }
          break;
        case Event.PlaybackError:
          console.log("playback error: ", event);
          void resetPlaybackQueue();
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
          break;
      }
    },
  );
};
