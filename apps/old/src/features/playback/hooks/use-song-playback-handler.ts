import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import {
  usePlaybackAddOffsetContext,
  usePlaybackModeContext,
  usePlaybackQueueRefreshContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import { usePlaybackSourcePersistence } from "@/src/features/playback/hooks/use-playback-source-persistence";
import {
  addSongToPlaybackQueue,
  playSongNow,
} from "@/src/features/playback/lib/playback-song-command-service";
import {
  persistSongPlaybackSource,
  resolveSongPlaybackSource,
} from "@/src/features/playback/lib/song-playback-source-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { posthog } from "@/src/lib/posthog";
import { useCallback } from "react";
import { type Track } from "react-native-track-player";

type SongPlaybackHandlerParams = {
  activeTrack?: Track;
  sourceId?: number;
  sourceType?: SourceType;
  sort: SortType;
  order: SortOrder;
  query: string;
};

export const useSongPlaybackHandler = ({
  activeTrack,
  sourceId,
  sourceType,
  sort,
  order,
  query,
}: SongPlaybackHandlerParams) => {
  const { shuffle } = usePlaybackModeContext();
  const { sendHaptic } = useHaptics();
  const { theme } = useThemeContext();
  const { addOffset, incrementAddOffset, resetAddOffset } =
    usePlaybackAddOffsetContext();
  const { requestQueueRefresh } = usePlaybackQueueRefreshContext();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();
  const { persistPlaybackSource } = usePlaybackSourcePersistence({
    sort,
    order,
    query,
  });

  const handlePlay = useCallback(
    async (song: SongType) => {
      sendHaptic("light");
      const id = activeTrack?.id ? activeTrack.id : -1;
      const playbackSource = resolveSongPlaybackSource({
        song,
        sourceId,
        sourceType,
      });

      const persistCurrentSongPlaybackSource = async () => {
        await persistSongPlaybackSource({
          song,
          source: playbackSource,
          shuffle,
          sort,
          order,
          persistPlaybackSource,
          query,
          theme,
          requestQueueRefresh,
          resetAddOffset,
        });
      };

      await runAdGatedPlaybackCommand({
        afterAdStarts: async () => {
          posthog.capture("play_ad");
          await persistCurrentSongPlaybackSource();
          await addSongToPlaybackQueue({
            song,
            theme,
            addOffset,
            incrementAddOffset,
          });
        },
        command: async () => {
          if (id === song.id) {
            return;
          }

          posthog.capture("play_song");
          try {
            const didPlaySong = await playSongNow({ song, theme });
            if (didPlaySong) {
              await persistCurrentSongPlaybackSource();
            }
          } catch (error) {
            console.log("error playing song: ", error);
          }
        },
      });
    },
    [
      activeTrack?.id,
      addOffset,
      incrementAddOffset,
      order,
      persistPlaybackSource,
      query,
      requestQueueRefresh,
      resetAddOffset,
      runAdGatedPlaybackCommand,
      sendHaptic,
      shuffle,
      sort,
      sourceId,
      sourceType,
      theme,
    ],
  );

  return { handlePlay };
};
