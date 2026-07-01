import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import {
  usePlaybackQueueFilterContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { persistPlaybackSourceStorage } from "@/src/features/playback/lib/playback-source-persistence-service";

type PlaybackSource = {
  id: number;
  type: SourceType;
};

type PlaybackSourcePersistenceParams = {
  sort: SortType;
  order: SortOrder;
  query: string;
};

export const usePlaybackSourcePersistence = ({
  sort,
  order,
  query,
}: PlaybackSourcePersistenceParams) => {
  const { setSourceId, setSourceType } = usePlaybackSourceContext();
  const { setOrder, setQuery, setSort } = usePlaybackQueueFilterContext();

  const persistPlaybackSource = async (source: PlaybackSource) => {
    setSourceType(source.type);
    setSourceId(source.id);
    await persistPlaybackSourceStorage(source);
    setSort(sort);
    setOrder(order);
    setQuery(query);
  };

  return { persistPlaybackSource };
};
