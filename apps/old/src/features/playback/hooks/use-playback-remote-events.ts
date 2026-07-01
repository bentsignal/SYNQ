import { NotificationType } from "@/src/constants/Types";
import {
  usePlaybackModeContext,
  usePlaybackQueueFilterContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import usePlayer from "@/src/features/playback/hooks/use-player";
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
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();
  const {
    pausePlayer,
    playPlayer,
    resetPlayer,
    seekToPosition,
    skipLeft,
    skipRight,
    updateQueue,
  } = usePlayer();

  const { loop, shuffle } = usePlaybackModeContext();
  const { sourceId, sourceType } = usePlaybackSourceContext();
  const { order, query, sort } = usePlaybackQueueFilterContext();

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
          void playPlayer();
          break;
        case Event.RemotePause:
          void pausePlayer();
          break;
        case Event.RemoteNext:
          runAdGatedPlaybackCommand({ command: skipRight });
          break;
        case Event.RemotePrevious:
          runAdGatedPlaybackCommand({ command: skipLeft });
          break;
        case Event.RemoteSeek:
          if (!adPlaying) {
            void seekToPosition(event.position);
          }
          break;
        case Event.PlaybackQueueEnded:
          if (loop && track && sourceType !== null && sourceId !== null) {
            updateQueue(
              track.id,
              shuffle,
              sourceType,
              sourceId,
              sort,
              order,
              query,
            );
            skipRight();
          }
          break;
        case Event.PlaybackError:
          console.log("playback error: ", event);
          void resetPlayer();
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
