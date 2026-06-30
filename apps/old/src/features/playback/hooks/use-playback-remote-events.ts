import { NotificationType } from "@/src/constants/Types";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { playAd } from "@/src/controllers/PlayerController";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import usePlayer from "@/src/hooks/usePlayer";
import TrackPlayer, {
  Event,
  type Track,
  useTrackPlayerEvents,
} from "react-native-track-player";

type PlaybackRemoteEventsParams = {
  track?: Track;
};

export const usePlaybackRemoteEvents = ({
  track,
}: PlaybackRemoteEventsParams) => {
  const { setShowOverlay } = useAppShellContext();
  const { addNotification, setShowNotificationModal } =
    useNotificationsContext();
  const { adPlaying, adURL, shouldPlayAd, setAdPlaying } =
    usePlaybackAdContext();
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();
  const { skipLeft, skipRight, updateQueue } = usePlayer();

  const { shuffle, loop, sourceType, sourceId, sort, order, query } =
    usePlaybackContext();

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
          TrackPlayer.play();
          break;
        case Event.RemotePause:
          TrackPlayer.pause();
          break;
        case Event.RemoteNext:
          if (!adPlaying) {
            if (!premium && shouldPlayAd && !adPlaying) {
              setAdPlaying(true);
              playAd(theme, adURL);
            } else {
              skipRight();
            }
          }
          break;
        case Event.RemotePrevious:
          if (!adPlaying) {
            if (!premium && shouldPlayAd && !adPlaying) {
              setAdPlaying(true);
              playAd(theme, adURL);
            } else {
              skipLeft();
            }
          }
          break;
        case Event.RemoteSeek:
          if (!adPlaying) {
            TrackPlayer.seekTo(event.position);
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
          TrackPlayer.reset();
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
