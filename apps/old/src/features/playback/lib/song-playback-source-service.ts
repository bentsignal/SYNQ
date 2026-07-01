import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";

type SongPlaybackSource = {
  id: number;
  type: SourceType;
};

type ResolveSongPlaybackSourceArgs = {
  song: SongType;
  sourceId?: number;
  sourceType?: SourceType;
};

type PersistSongPlaybackSourceArgs = {
  order: SortOrder;
  persistPlaybackSource: (source: SongPlaybackSource) => Promise<void>;
  query: string;
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
  shuffle: boolean;
  song: SongType;
  sort: SortType;
  source?: SongPlaybackSource;
  theme: string;
};

export const resolveSongPlaybackSource = ({
  song,
  sourceId,
  sourceType,
}: ResolveSongPlaybackSourceArgs): SongPlaybackSource | undefined => {
  const playbackSourceId = sourceId ?? song.sourceId;
  const playbackSourceType = sourceType ?? song.sourceType;

  if (playbackSourceId === undefined || playbackSourceType === undefined) {
    return undefined;
  }

  return {
    id: playbackSourceId,
    type: playbackSourceType,
  };
};

export const persistSongPlaybackSource = async ({
  order,
  persistPlaybackSource,
  query,
  requestQueueRefresh,
  resetAddOffset,
  shuffle,
  song,
  sort,
  source,
  theme,
}: PersistSongPlaybackSourceArgs) => {
  if (!source) {
    return;
  }

  await updateUpcomingQueue({
    currentId: song.id,
    shuffleValue: shuffle,
    sourceTypeValue: source.type,
    sourceIdValue: source.id,
    sort,
    order,
    query,
    theme,
    requestQueueRefresh,
    resetAddOffset,
  });
  await persistPlaybackSource(source);
};
