import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { usePlaybackModeContext } from "@/src/features/playback/context/PlaybackProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import { usePlaybackSourcePersistence } from "@/src/features/playback/hooks/use-playback-source-persistence";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
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
  const { addSongToQueue, playSong, updateQueue } = usePlayer();
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
      const playbackSourceId = sourceId ?? song.sourceId;
      const playbackSourceType = sourceType ?? song.sourceType;
      const hasPlaybackSource =
        playbackSourceType !== undefined && playbackSourceId !== undefined;

      const persistSongPlaybackSource = async () => {
        if (!hasPlaybackSource) {
          return;
        }

        await updateQueue(
          song.id,
          shuffle,
          playbackSourceType,
          playbackSourceId,
          sort,
          order,
          query,
        );
        await persistPlaybackSource({
          id: playbackSourceId,
          type: playbackSourceType,
        });
      };

      await runAdGatedPlaybackCommand({
        afterAdStarts: async () => {
          posthog.capture("play_ad");
          await persistSongPlaybackSource();
          await addSongToQueue(song);
        },
        command: async () => {
          if (id === song.id) {
            return;
          }

          posthog.capture("play_song");
          try {
            const didPlaySong = await playSong(song);
            if (didPlaySong) {
              await persistSongPlaybackSource();
            }
          } catch (error) {
            console.log("error playing song: ", error);
          }
        },
      });
    },
    [
      activeTrack?.id,
      addSongToQueue,
      order,
      persistPlaybackSource,
      playSong,
      query,
      runAdGatedPlaybackCommand,
      sendHaptic,
      shuffle,
      sort,
      sourceId,
      sourceType,
      updateQueue,
    ],
  );

  return { handlePlay };
};
