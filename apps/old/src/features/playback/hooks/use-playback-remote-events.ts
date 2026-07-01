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
  handlePlaybackRemoteEvent,
  playbackRemoteEvents,
} from "@/src/features/playback/lib/playback-remote-event-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { type Track, useTrackPlayerEvents } from "react-native-track-player";

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

  useTrackPlayerEvents(playbackRemoteEvents, (event) => {
    handlePlaybackRemoteEvent({
      addNotification,
      addOffset,
      adPlaying,
      decrementAddOffset,
      event,
      incrementAddOffset,
      loop,
      order,
      query,
      requestQueueRefresh,
      resetAddOffset,
      runAdGatedPlaybackCommand,
      sendPlaybackError: sendHaptic,
      setShowNotificationModal,
      setShowOverlay,
      shuffle,
      sort,
      sourceId,
      sourceType,
      theme,
      track,
    });
  });
};
