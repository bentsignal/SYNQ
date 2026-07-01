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
  addSongToPlaybackQueueAfterAdStarts,
  playSongFromLibrary,
} from "@/src/features/playback/lib/playback-song-command-service";
import {
  persistSongPlaybackSource,
  resolveSongPlaybackSource,
} from "@/src/features/playback/lib/song-playback-source-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
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
          await addSongToPlaybackQueueAfterAdStarts({
            song,
            theme,
            addOffset,
            incrementAddOffset,
            persistSongPlaybackSource: persistCurrentSongPlaybackSource,
          });
        },
        command: async () => {
          await playSongFromLibrary({
            activeTrackId: activeTrack?.id,
            persistSongPlaybackSource: persistCurrentSongPlaybackSource,
            song,
            theme,
          });
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
